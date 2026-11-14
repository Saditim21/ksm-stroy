#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
build-fonts.py - KSM Stroy, Diptych (design spec docs/superpowers/specs/
2026-11-14-ksmstroy-diptych-design.md, section 3.1): self-hosted Cormorant
Garamond (KSM Display, normal and italic) and Manrope (KSM Text) with the
Bulgarian letterforms, each face built as ONE file.

Sources (pinned to one google/fonts commit, sha256-checked) are the canonical
variable masters. Building one file from the whole master keeps the kerning
between Cyrillic letters and punctuation (for example "„С" or "Г,"), which a
font split per script cannot hold.

Pipeline, per face:
  1. keep only the language systems we use (cyrl default = Russian forms, cyrl/BGR);
  2. pre-subset to the coverage below, so instancing is fast;
  3. fontTools instancer: Cormorant normal wght limited to 500-600 and kept
     variable; Cormorant italic pinned at wght 500 (a static face); Manrope wght
     limited to 400-600 and kept variable;
  4. Cormorant (both): freeze lnum into the cmap, so figures are never old-style
     (Cormorant's default figures are); tnum stays a live feature and gives
     tabular lining figures;
  5. final subset: features ccmp locl calt liga kern mark mkmk tnum case, no
     hinting, no glyph names, name IDs 0-6 + 13/14 (OFL);
  6. tabular-digit fix (a no-op unless needed): a tabular digit that drifts a few
     units from the others gets their advance;
  7. checks (Bulgarian forms, lining + tabular digits, coverage, kept features,
     the 90 KiB budget) and fallback metrics; exits 1 if a check fails.

Coverage: the Cyrillic, Basic Latin and punctuation sets below, in each file (one file
per face, so the kerning between scripts survives).

Outputs (in --out, default ./dist):
  ksm-display.woff2         Cormorant Garamond, wght 500-600 variable, lining
                            figures frozen as the default
  ksm-display-italic.woff2  Cormorant Garamond Italic, static 500, lining figures
                            frozen as the default
  ksm-text.woff2            Manrope, wght 400-600 variable
  fonts.css                 @font-face rules for /fonts/ + metric-matched fallbacks
  fonts.preview.css         the same with relative URLs, for local specimens
  font-report.json          sizes, features, checks and fallback numbers
  OFL-*.txt                 licences that must travel with the fonts
  work/                     unshipped inspection copies (with glyph names)

The fallback faces are measured against Georgia, Times New Roman and Noto Serif
(Display) and Segoe UI, Arial and Roboto (Text). Georgia, Times New Roman, Segoe
UI and Arial are read from --system-fonts; Noto Serif and Roboto, the Android
faces, from their pinned google/fonts masters, which are never shipped.

Usage (isolated mode; fontTools 4.68 + brotli importable, or via --pylib):
  python -I -X utf8 build-fonts.py --pylib <dir> --fetch --src <dir> --out <dir> [--copy <src dirs>]
  python -I -X utf8 build-fonts.py --pylib <dir> --experiment   # marginal byte costs
Output is byte-identical between runs (timestamps are kept from the sources).
"""

import argparse
import collections
import hashlib
import io
import json
import os
import sys
import time
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))

ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
ap.add_argument('--pylib', help='extra sys.path entry that holds fontTools + brotli')
ap.add_argument('--src', default=os.path.join(HERE, 'src'), help='source folder (default ./src)')
ap.add_argument('--out', default=os.path.join(HERE, 'dist'), help='output folder (default ./dist)')
ap.add_argument('--fetch', action='store_true', help='download missing sources from the pinned URLs')
ap.add_argument('--url-prefix', default='/fonts/', help='URL prefix used in fonts.css')
ap.add_argument('--system-fonts', default='C:/Windows/Fonts', help='folder with the local fallback fonts')
ap.add_argument('--copy', nargs='*', default=[], help='folders whose text must be covered by the subset (report only)')
ap.add_argument('--experiment', action='store_true', help='print marginal byte costs of optional features')
ARGS = ap.parse_args()
if ARGS.pylib:
    sys.path.insert(0, os.path.abspath(ARGS.pylib))

from fontTools import subset as ftsubset  # noqa: E402
from fontTools import version as FONTTOOLS_VERSION  # noqa: E402
from fontTools.ttLib import TTFont  # noqa: E402
from fontTools.varLib import instancer  # noqa: E402

# --------------------------------------------------------------------------------------
# Sources
# --------------------------------------------------------------------------------------
GF_COMMIT = 'cc39c4c2c304bc368c9b7c311ea2bcc6013299fe'
GF = f'https://raw.githubusercontent.com/google/fonts/{GF_COMMIT}/ofl/'
SOURCES = {
    'cormorant': dict(path='gf-cormorantgaramond/CormorantGaramond[wght].ttf',
                      url=GF + 'cormorantgaramond/CormorantGaramond%5Bwght%5D.ttf',
                      sha256='b20b7d9626dd956b2c5e558692ad328b1f19e3275e2782db4fa07670d83f35e0'),
    'cormorant-italic': dict(path='gf-cormorantgaramond/CormorantGaramond-Italic[wght].ttf',
                             url=GF + 'cormorantgaramond/CormorantGaramond-Italic%5Bwght%5D.ttf',
                             sha256='0f48ea6abb2084537854f7174c470991a463b13036309e3b50a81511611c530d'),
    'cormorant-ofl': dict(path='gf-cormorantgaramond/OFL.txt', url=GF + 'cormorantgaramond/OFL.txt',
                          sha256='60700d351cac4650c51f3f9db318d2a420f8b45052dba2715eb5fec41f0f6956'),
    'manrope': dict(path='gf-manrope/Manrope[wght].ttf', url=GF + 'manrope/Manrope%5Bwght%5D.ttf',
                    sha256='3ae11c49db0455a3cc33e37d380f20fdb8c7f8b41dc07625c177e3d87a9d6ae6'),
    'manrope-ofl': dict(path='gf-manrope/OFL.txt', url=GF + 'manrope/OFL.txt',
                        sha256='58172e0c0fac2cda8a37b348164bb55e44b0e69051e557e92b1d3f6910141f7b'),
    # Measured for the Android fallback faces only; never shipped.
    'noto-serif': dict(path='gf-notoserif/NotoSerif[wdth,wght].ttf',
                       url=GF + 'notoserif/NotoSerif%5Bwdth%2Cwght%5D.ttf',
                       sha256='4d8e6761424656867019081a1a01336f3cb086982682698714054fc33f782713'),
    'noto-serif-italic': dict(path='gf-notoserif/NotoSerif-Italic[wdth,wght].ttf',
                              url=GF + 'notoserif/NotoSerif-Italic%5Bwdth%2Cwght%5D.ttf',
                              sha256='e87acbc6c0efd0d9a20d6a8cbbda2b266c14be3a3a6f5af8ec9d7b2460570ad1'),
    'roboto': dict(path='gf-roboto/Roboto[wdth,wght].ttf', url=GF + 'roboto/Roboto%5Bwdth%2Cwght%5D.ttf',
                   sha256='d7598e12c5dbef095ff8272cfc55da0250bd07fbdecbac8a530b9b277872a134'),
}

# --------------------------------------------------------------------------------------
# Coverage
# --------------------------------------------------------------------------------------


def R(a, b):
    return list(range(a, b + 1))


CYRILLIC = R(0x0400, 0x045F) + R(0x0490, 0x0491) + R(0x04B0, 0x04B1) + [0x2116]
LATIN = R(0x0020, 0x007E)
PUNCT = [
    0x00A0,            # no-break space (bg-BG Intl uses it as group separator and before units)
    0x00A7, 0x00A9,    # section sign, copyright (both in the site copy)
    0x00AB, 0x00BB,    # guillemets
    0x00AD,            # soft hyphen
    0x00B0, 0x00B1,    # degree, plus-minus (kota +-0,00)
    0x00B2, 0x00B3,    # squared, cubed (m2, m3)
    0x00B7,            # middle dot (data-row separator)
    0x00D7,            # multiplication sign (dimensions)
    0x2010, 0x2013, 0x2014,          # hyphen, en dash, em dash
    *R(0x2018, 0x201E),              # quotes, including Bulgarian low-9 quote
    0x2022, 0x2026,                  # bullet, ellipsis
    0x2032, 0x2033,                  # prime, double prime
    0x2039, 0x203A,                  # single guillemets
    0x20AC,                          # euro
    0x2212,                          # minus (negative elevations)
]
COMBINING = [0x0300, 0x0301]  # grave and acute (stress marks); what mark/mkmk position

FULL_SET = sorted(set(CYRILLIC + LATIN + PUNCT + COMBINING))

# The text files --copy reads, and the folders it skips.
COPY_EXTS = {'.js', '.jsx', '.ts', '.tsx', '.mjs', '.html', '.json', '.md', '.csv', '.txt', '.css'}
COPY_SKIP = {'node_modules', '.git', 'dist', 'build', '.vercel', 'coverage'}

KEEP_SCRIPTS = ['DFLT', 'cyrl', 'latn']
KEEP_LANGSYS = {'cyrl': {'BGR '}, 'latn': set(), 'DFLT': set()}  # Russian etc. = cyrl default
FEATURES = ['ccmp', 'locl', 'calt', 'liga', 'kern', 'mark', 'mkmk', 'tnum', 'case']

# One entry per shipped file. `limits` go to the instancer: a range keeps the axis
# variable, a number pins it. `bg_letters` are the letters each face must draw in a
# Bulgarian form of its own under cyrl/BGR, as the 2026-11-14 masters do. A few more
# BGR substitutions lead to a glyph drawn exactly like the default one (Cormorant's
# Д И Й Л ф л, and Д И Й Ѝ in its italic; Manrope's К): the default is already the
# Bulgarian shape. The report lists them; they are not a failure. The italic draws
# fewer Bulgarian forms because italic Cyrillic is already close to them.
FAMILIES = {
    'display': dict(
        source='cormorant', ofl='cormorant-ofl', ofl_out='OFL-Cormorant.txt', out='ksm-display',
        css_family='KSM Display', style='normal', limits={'wght': (500, 600)}, freeze='lnum',
        check_weights=[500, 550, 600], bg_letters='ЍФвгджзийкмнпртцчшщъьюѝ'),  # titles 500, counts 600
    'display-italic': dict(
        source='cormorant-italic', ofl=None, out='ksm-display-italic',
        css_family='KSM Display', style='italic', limits={'wght': 500}, freeze='lnum',
        check_weights=[500], bg_letters='ЛФвджзкю'),     # the em word, 500
    'text': dict(
        source='manrope', ofl='manrope-ofl', ofl_out='OFL-Manrope.txt', out='ksm-text',
        css_family='KSM Text', style='normal', limits={'wght': (400, 600)}, freeze=None,
        check_weights=[400, 500, 600], bg_letters='ДЖЛвгджзийклнптцчшщьюѝ',  # body 400, labels 500, ids 600
        # Manrope draws none of these and the site's copy uses none (checked
        # 2026-11-14); a browser draws such a character from the next font.
        allowed_missing={'U+0300', 'U+0301', 'U+04B0', 'U+04B1', 'U+2010', 'U+2032', 'U+2033'}),
}

# Bulgarian letter + space sample for the fallback metrics. Counts of every Cyrillic
# letter (case kept) and the space in the deduplicated Cyrillic prose runs of the site
# copy (ksm-stroy/src + golden-residence/src, 1,026 unique runs, 23,963 characters),
# derived 2026-11-13 by tools/bgfreq.py. Case-folded order: а и е о т н р с л в к д п м ...
BG_COUNTS = {
    ' ': 2787, 'А': 120, 'Б': 79, 'В': 85, 'Г': 77, 'Д': 112, 'Е': 31, 'Ж': 34, 'З': 85,
    'И': 31, 'Й': 0, 'К': 162, 'Л': 18, 'М': 106, 'Н': 74, 'О': 102, 'П': 168, 'Р': 129,
    'С': 154, 'Т': 51, 'У': 4, 'Ф': 5, 'Х': 3, 'Ц': 5, 'Ч': 4, 'Ш': 0, 'Щ': 0, 'Ъ': 1,
    'Ь': 0, 'Ю': 0, 'Я': 0,
    'а': 2400, 'б': 302, 'в': 699, 'г': 286, 'д': 548, 'е': 1940, 'ж': 268, 'з': 384,
    'и': 2004, 'й': 128, 'к': 557, 'л': 765, 'м': 450, 'н': 1543, 'о': 1693, 'п': 465,
    'р': 1145, 'с': 969, 'т': 1640, 'у': 189, 'ф': 129, 'х': 68, 'ц': 127, 'ч': 129,
    'ш': 64, 'щ': 128, 'ъ': 279, 'ь': 6, 'ю': 24, 'я': 297,
}

# Fallback faces. A face is read from --system-fonts (`file`) or from a pinned source
# (`source`). Each weight band gets its own metric-matched @font-face, tuned at the
# weight of the role that uses it most.
FALLBACKS = {
    'display': [
        dict(name='Georgia', css='KSM Display Fallback Georgia', file='georgia.ttf', local=['Georgia']),
        dict(name='Times New Roman', css='KSM Display Fallback Times', file='times.ttf',
             local=['Times New Roman', 'TimesNewRomanPSMT']),
        dict(name='Noto Serif', css='KSM Display Fallback Noto', source='noto-serif',
             local=['Noto Serif', 'NotoSerif', 'NotoSerif-Regular', 'Noto Serif Regular']),
    ],
    'display-italic': [
        dict(name='Georgia Italic', css='KSM Display Fallback Georgia', file='georgiai.ttf',
             local=['Georgia Italic', 'Georgia-Italic']),
        dict(name='Times New Roman Italic', css='KSM Display Fallback Times', file='timesi.ttf',
             local=['Times New Roman Italic', 'TimesNewRomanPS-ItalicMT']),
        dict(name='Noto Serif Italic', css='KSM Display Fallback Noto', source='noto-serif-italic',
             local=['Noto Serif Italic', 'NotoSerif-Italic']),
    ],
    'text': [
        dict(name='Segoe UI', css='KSM Text Fallback Segoe', file='segoeui.ttf', local=['Segoe UI', 'SegoeUI']),
        dict(name='Arial', css='KSM Text Fallback Arial', file='arial.ttf', local=['Arial', 'ArialMT']),
        dict(name='Roboto', css='KSM Text Fallback Roboto', source='roboto',
             local=['Roboto', 'Roboto-Regular', 'Roboto Regular']),
        dict(name='Helvetica Neue', css=None, file=None, local=['Helvetica Neue'],
             skip='macOS/iOS only: no Cyrillic advance data available here and none is published '
                  '(capsize metrics are Latin-weighted). Arial ships on macOS and iOS, so the Arial '
                  'face covers Apple platforms with measured numbers.'),
    ],
}
BANDS = {
    'display': [dict(range=(500, 549), tune=500, roles='h1, h2, h3, titles (500)'),
                dict(range=(550, 600), tune=600, roles='counts (600)')],
    'display-italic': [dict(range=(500, 500), tune=500, roles='the em word (500)')],
    'text': [dict(range=(400, 449), tune=400, roles='body, small (400)'),
             dict(range=(450, 600), tune=500, roles='labels, buttons (500), ids (600)')],
}

BUDGET_BYTES = 90 * 1024  # spec section 3.1: the three files together, 90 KiB

# --------------------------------------------------------------------------------------
# Helpers
# --------------------------------------------------------------------------------------


def log(*a):
    print(*a, flush=True)


def sha256(path):
    with open(path, 'rb') as fh:
        return hashlib.sha256(fh.read()).hexdigest()


def fetch_sources(src_dir, fetch):
    paths = {}
    for key, s in SOURCES.items():
        p = os.path.join(src_dir, s['path'])
        if not os.path.exists(p):
            if not fetch:
                raise SystemExit(f'missing source {p} (run with --fetch)')
            os.makedirs(os.path.dirname(p), exist_ok=True)
            req = urllib.request.Request(s['url'], headers={'User-Agent': 'font-build-script'})
            with urllib.request.urlopen(req, timeout=180) as r:
                data = r.read()
            with open(p, 'wb') as fh:
                fh.write(data)
            log('fetched', s['url'])
        digest = sha256(p)
        if digest != s['sha256']:
            raise SystemExit(f'sha256 mismatch for {p}: {digest}')
        paths[key] = p
    return paths


def to_bytes(font, flavor=None):
    buf = io.BytesIO()
    font.flavor = flavor
    font.save(buf)
    return buf.getvalue()


def load(data):
    return TTFont(io.BytesIO(data), recalcTimestamp=False)


def is_variable(font):
    return 'fvar' in font


def prune_langsys(font):
    """Keep only the language systems we use (cyrl/BGR); Russian is the cyrl default."""
    for tag in ('GSUB', 'GPOS'):
        if tag not in font or not font[tag].table.ScriptList:
            continue
        for sr in font[tag].table.ScriptList.ScriptRecord:
            keep = KEEP_LANGSYS.get(sr.ScriptTag)
            if keep is None:
                continue  # the whole script goes in the subsetter (layout_scripts)
            recs = [r for r in sr.Script.LangSysRecord if r.LangSysTag in keep]
            sr.Script.LangSysRecord = recs
            sr.Script.LangSysCount = len(recs)


def run_subset(font, unicodes, features, glyph_names=True):
    o = ftsubset.Options()
    o.layout_features = list(features)
    o.layout_scripts = KEEP_SCRIPTS
    o.hinting = False            # no hinting: TrueType instructions are dropped
    o.legacy_kern = False
    o.notdef_glyph = True
    o.notdef_outline = False     # missing characters fall back per character anyway
    o.glyph_names = glyph_names
    o.name_IDs = [0, 1, 2, 3, 4, 5, 6, 13, 14]  # keep copyright + licence (OFL)
    o.name_languages = [0x0409]
    o.name_legacy = False
    o.drop_tables = list(o.drop_tables) + ['DSIG', 'meta']
    s = ftsubset.Subsetter(options=o)
    s.populate(unicodes=unicodes)
    s.subset(font)
    return font


def feature_lookups(font, tag, feature, script=None, lang=None):
    """Lookup indices of `feature`, either everywhere (script None) or as reached through
    script/langsys (lang None = the script's default langsys)."""
    if tag not in font:
        return []
    t = font[tag].table
    fl = t.FeatureList.FeatureRecord
    if script is None:
        return sorted({li for fr in fl if fr.FeatureTag == feature for li in fr.Feature.LookupListIndex})
    for sr in t.ScriptList.ScriptRecord:
        if sr.ScriptTag != script:
            continue
        if lang is None:
            ls = sr.Script.DefaultLangSys
        else:
            ls = next((r.LangSys for r in sr.Script.LangSysRecord if r.LangSysTag == lang), None)
        if ls is None:
            return []
        return sorted({li for fi in ls.FeatureIndex if fl[fi].FeatureTag == feature
                       for li in fl[fi].Feature.LookupListIndex})
    return []


def single_subst(font, lookups):
    """Compose the single substitutions of `lookups` in lookup order (a->b then b->c = a->c)."""
    gsub = font['GSUB'].table
    composed = {}
    for li in lookups:
        lk = gsub.LookupList.Lookup[li]
        m = {}
        for st in lk.SubTable:
            t = lk.LookupType
            if t == 7:
                st = st.ExtSubTable
                t = st.LookupType
            if t != 1:
                raise ValueError(f'lookup {li} is type {t}, not a single substitution')
            for a, b in st.mapping.items():
                m.setdefault(a, b)
        for a in list(composed):
            if composed[a] in m:
                composed[a] = m[composed[a]]
        for a, b in m.items():
            composed.setdefault(a, b)
    return composed


def freeze_feature(font, feature):
    """Bake a single-substitution feature into the cmap (what pyftfeatfreeze does):
    every code point whose glyph the feature replaces now maps to the replacement."""
    mapping = single_subst(font, feature_lookups(font, 'GSUB', feature))
    changed = {}
    for table in font['cmap'].tables:
        if not table.isUnicode():
            continue
        for cp, g in list(table.cmap.items()):
            if g in mapping:
                table.cmap[cp] = mapping[g]
                changed[cp] = (g, mapping[g])
    return changed


def tabular_digit_glyphs(font):
    """The glyphs that `tnum` gives for the default 0-9."""
    cmap = font.getBestCmap()
    tnum = single_subst(font, feature_lookups(font, 'GSUB', 'tnum'))
    return [tnum.get(cmap[0x30 + i], cmap[0x30 + i]) for i in range(10)]


def advance_signature(font, glyph):
    """Per-region advance-width deltas from the gvar phantom points (zero deltas dropped)."""
    sig = {}
    for tv in font['gvar'].variations.get(glyph, []):
        c = tv.coordinates
        p1, p2 = c[-4] or (0, 0), c[-3] or (0, 0)
        d = p2[0] - p1[0]
        if d:
            sig[tuple(sorted(tv.axes.items()))] = d
    return sig


def equalize_tabular_digits(font):
    """Give every tabular digit the default advance and the advance variation of the
    majority, so tnum digits are equal at every weight, then rebuild HVAR from gvar.
    A no-op when they already agree. Refuses anything bigger than a drift of 1% of the em.
    A static face only has its default advances to compare."""
    glyphs = tabular_digit_glyphs(font)
    hm = font['hmtx']
    upm = font['head'].unitsPerEm
    adv = collections.Counter(hm[g][0] for g in glyphs).most_common(1)[0][0]
    if not is_variable(font):
        fixed = {}
        for g in glyphs:
            if hm[g][0] == adv:
                continue
            if abs(hm[g][0] - adv) > 0.01 * upm:
                raise SystemExit(f'{g}: tabular advance differs by more than a small drift; refusing to patch')
            fixed[g] = dict(before=dict(default=hm[g][0]), after=dict(default=adv))
            hm[g] = (adv, hm[g][1])
        return fixed
    from fontTools.varLib.hvar import add_HVAR
    sigs = {g: advance_signature(font, g) for g in glyphs}
    majority = dict(collections.Counter(tuple(sorted(s.items())) for s in sigs.values()).most_common(1)[0][0])
    fixed = {}
    for g in glyphs:
        if hm[g][0] == adv and sigs[g] == majority:
            continue
        if abs(hm[g][0] - adv) > 0.01 * upm or any(abs(v - majority.get(k, 0)) > 0.01 * upm for k, v in sigs[g].items()):
            raise SystemExit(f'{g}: tabular advance differs by more than a small drift; refusing to patch')
        regions = {tuple(sorted(tv.axes.items())) for tv in font['gvar'].variations.get(g, [])}
        if set(majority) - regions:
            raise SystemExit(f'{g}: majority has variation regions the glyph lacks')
        before = dict(default=hm[g][0], deltas={str(k): v for k, v in sigs[g].items()})
        hm[g] = (adv, hm[g][1])  # outline untouched; the right side bearing absorbs the drift
        for tv in font['gvar'].variations.get(g, []):
            key = tuple(sorted(tv.axes.items()))
            c = tv.coordinates
            p1, p2 = c[-4] or (0, 0), c[-3] or (0, 0)
            c[-3] = (p1[0] + majority.get(key, 0), p2[1])
        fixed[g] = dict(before=before, after=dict(default=hm[g][0],
                                                  deltas={str(k): v for k, v in advance_signature(font, g).items()}))
    if fixed:
        add_HVAR(font)
    return fixed


def build_font(src_path, limits, unicodes, features, freeze=None):
    """pre-subset -> instance -> freeze -> final subset -> tabular fix.
    Returns (TTFont with glyph names, info)."""
    f = TTFont(src_path, recalcTimestamp=False)
    prune_langsys(f)
    info = {}
    pre_features = list(features) + ([freeze] if freeze else [])
    run_subset(f, unicodes, pre_features)
    f = load(to_bytes(f))
    f = instancer.instantiateVariableFont(f, limits, inplace=False, optimize=True, updateFontNames=False)
    f = load(to_bytes(f))
    if freeze:
        changed = freeze_feature(f, freeze)
        info['frozen'] = {f'U+{cp:04X}': f'{a} -> {b}' for cp, (a, b) in sorted(changed.items())}
    run_subset(f, unicodes, features)
    f = load(to_bytes(f))
    if 0x30 in f.getBestCmap():
        info['tabular_digit_fix'] = equalize_tabular_digits(f)
    return load(to_bytes(f)), info


def ship_bytes(font):
    """woff2 without glyph names (post format 3)."""
    f = load(to_bytes(font))
    f['post'].formatType = 3.0
    return to_bytes(f, 'woff2')


def ranges_str(cps):
    cps = sorted(set(cps))
    out, start, prev = [], None, None
    for c in cps:
        if start is None:
            start = prev = c
        elif c == prev + 1:
            prev = c
        else:
            out.append((start, prev))
            start = prev = c
    if start is not None:
        out.append((start, prev))
    return ','.join(f'U+{a:04X}' if a == b else f'U+{a:04X}-{b:04X}' for a, b in out)


def text_characters(dirs):
    """Every character (code point) in the text files under `dirs`, with its count."""
    cnt = collections.Counter()
    for root in dirs:
        for dp, dns, fns in os.walk(root):
            dns[:] = [d for d in dns if d not in COPY_SKIP]
            for fn in fns:
                if os.path.splitext(fn)[1].lower() in COPY_EXTS:
                    try:
                        with open(os.path.join(dp, fn), encoding='utf-8') as fh:
                            cnt.update(fh.read())
                    except (UnicodeDecodeError, OSError):
                        pass
    return cnt


# --------------------------------------------------------------------------------------
# Checks
# --------------------------------------------------------------------------------------


def glyph_signature(font, name):
    """Outline, advance and, in a variable face, the variation deltas: two glyphs drawn
    alike at the default weight may still part at another one."""
    glyf = font['glyf']
    coords, ends, _ = glyf[name].getCoordinates(glyf)
    deltas = ()
    if 'gvar' in font:
        deltas = tuple((tuple(sorted(tv.axes.items())), tuple(tv.coordinates))
                       for tv in font['gvar'].variations.get(name, []))
    return tuple(coords), tuple(ends), font['hmtx'][name][0], deltas


def features_by_script(font):
    out = {}
    for tag in ('GSUB', 'GPOS'):
        if tag not in font:
            continue
        t = font[tag].table
        fl = t.FeatureList.FeatureRecord
        d = {}
        for sr in t.ScriptList.ScriptRecord:
            if sr.Script.DefaultLangSys:
                d[f'{sr.ScriptTag}/dflt'] = sorted({fl[i].FeatureTag for i in sr.Script.DefaultLangSys.FeatureIndex})
            for r in sr.Script.LangSysRecord:
                d[f'{sr.ScriptTag}/{r.LangSysTag.strip()}'] = sorted({fl[i].FeatureTag for i in r.LangSys.FeatureIndex})
        out[tag] = d
    return out


def check_bgr(font):
    cmap = font.getBestCmap()
    rev = {}
    for cp, g in sorted(cmap.items()):
        rev.setdefault(g, cp)
    mapping = single_subst(font, feature_lookups(font, 'GSUB', 'locl', 'cyrl', 'BGR '))
    default = single_subst(font, feature_lookups(font, 'GSUB', 'locl', 'cyrl', None))
    letters, identical = [], []
    for a, b in mapping.items():
        ch = chr(rev[a]) if a in rev else a
        if glyph_signature(font, a) == glyph_signature(font, b):
            identical.append(ch)
        else:
            letters.append(ch)
    return dict(bgr_substitutions=len(mapping), letters_with_bg_forms=''.join(sorted(letters)),
                identical_outlines=identical, russian_default_locl=len(default))


def hvar_advances(font, glyphs, wght):
    """Advances at `wght` as browsers compute them: hmtx + HVAR delta (avar applied)."""
    from fontTools.varLib.models import normalizeLocation, piecewiseLinearMap
    from fontTools.varLib.varStore import VarStoreInstancer
    axes = {a.axisTag: (a.minValue, a.defaultValue, a.maxValue) for a in font['fvar'].axes}
    loc = normalizeLocation({'wght': wght}, axes)
    if 'avar' in font:
        loc = {k: piecewiseLinearMap(v, font['avar'].segments.get(k, {-1: -1, 0: 0, 1: 1})) for k, v in loc.items()}
    hvar = font['HVAR'].table
    vsi = VarStoreInstancer(hvar.VarStore, font['fvar'].axes, loc)
    out = []
    for g in glyphs:
        idx = hvar.AdvWidthMap.mapping[g] if hvar.AdvWidthMap else font.getGlyphID(g)
        out.append(round(font['hmtx'][g][0] + vsi[idx], 2))
    return out


def at_weight(font_bytes, w):
    """The face at `w`: an instance of a variable face, a static face as it is."""
    f = load(font_bytes)
    return instancer.instantiateVariableFont(f, {'wght': w}, inplace=False) if is_variable(f) else f


def check_digits(font_bytes, weights):
    rows = []
    vf = load(font_bytes)
    variable = is_variable(vf)
    vf_tab = tabular_digit_glyphs(vf)
    vf_cmap = vf.getBestCmap()
    vf_default = [vf_cmap[0x30 + i] for i in range(10)]
    sigs = {tuple(sorted(advance_signature(vf, g).items())) for g in vf_tab} if variable else {()}
    for w in weights:
        s = at_weight(font_bytes, w)
        cmap, hm, glyf = s.getBestCmap(), s['hmtx'], s['glyf']
        upm = s['head'].unitsPerEm
        dflt = [cmap[0x30 + i] for i in range(10)]
        tnum = single_subst(s, feature_lookups(s, 'GSUB', 'tnum'))
        tab = [tnum.get(g, g) for g in dflt]
        if variable:
            hv_tab = hvar_advances(vf, vf_tab, w)
            hv_def = hvar_advances(vf, vf_default, w)
        else:
            hv_tab = [hm[g][0] for g in tab]
            hv_def = [hm[g][0] for g in dflt]

        def bounds(names):
            out = []
            for g in names:
                gl = glyf[g]
                gl.recalcBounds(glyf)
                out.append((getattr(gl, 'yMin', 0), getattr(gl, 'yMax', 0)))
            return out

        bd, bt = bounds(dflt), bounds(tab)
        lining = (min(b[0] for b in bd) > -0.03 * upm
                  and max(b[1] for b in bd) - min(b[1] for b in bd) < 0.06 * upm)
        rows.append(dict(
            wght=w,
            default_advances=[hm[g][0] for g in dflt],
            default_is_lining=lining,
            default_min_yMin=min(b[0] for b in bd),
            tnum_advances=[hm[g][0] for g in tab],
            tnum_equal=len({hm[g][0] for g in tab}) == 1,
            tnum_advances_hvar=hv_tab,
            tnum_equal_hvar=len(set(hv_tab)) == 1,
            hvar_matches_gvar=all(abs(a - hm[g][0]) <= 0.5 for a, g in zip(hv_tab + hv_def, tab + dflt)),
            tnum_is_lining=min(b[0] for b in bt) > -0.03 * upm,
        ))
    return dict(variable=variable, tnum_variation_identical_for_all_digits=len(sigs) == 1, by_weight=rows)


def pair_kern(font, left, right):
    """First kern value for a glyph pair (default location), or None if no subtable covers it."""
    gpos = font['GPOS'].table
    for li in feature_lookups(font, 'GPOS', 'kern'):
        lk = gpos.LookupList.Lookup[li]
        for st in lk.SubTable:
            if lk.LookupType == 9:
                st = st.ExtSubTable
            if getattr(st, 'LookupType', 2) != 2 or left not in st.Coverage.glyphs:
                continue
            if st.Format == 1:
                ps = st.PairSet[st.Coverage.glyphs.index(left)]
                for pvr in ps.PairValueRecord:
                    if pvr.SecondGlyph == right:
                        return getattr(pvr.Value1, 'XAdvance', 0) or 0
            else:
                c1 = st.ClassDef1.classDefs.get(left, 0)
                c2 = st.ClassDef2.classDefs.get(right, 0)
                v = st.Class1Record[c1].Class2Record[c2].Value1
                val = getattr(v, 'XAdvance', 0) if v else 0
                if val:
                    return val
    return None


CROSS_PAIRS = ['„С', '„Д', 'а“', 'о“', 'т“', 'Г.', 'Г,', 'Т.', 'Р.', 'У,', 'Т-', 'Г–', 'ТА', 'Ya', 'T.']


def check_cross_kerning(font):
    cmap = font.getBestCmap()
    out = {}
    for p in CROSS_PAIRS:
        a, b = cmap.get(ord(p[0])), cmap.get(ord(p[1]))
        out[p] = None if a is None or b is None else pair_kern(font, a, b)
    return out


def copy_coverage(dirs, cmap_cps):
    """Characters used in the site copy that the subset does not cover."""
    cnt = text_characters(dirs)
    return {f'U+{ord(c):04X}': n for c, n in sorted(cnt.items()) if ord(c) >= 0x20 and ord(c) not in cmap_cps
            and ord(c) not in (0x2028, 0x2029)}


# --------------------------------------------------------------------------------------
# Fallback metrics
# --------------------------------------------------------------------------------------


def sample_avg_advance(font, apply_bgr=True):
    """Weighted average advance (em) of the Bulgarian letter+space sample, using the
    Bulgarian locl forms where the font has them (they render under lang=bg)."""
    cmap, hm = font.getBestCmap(), font['hmtx']
    upm = font['head'].unitsPerEm
    bgr = {}
    if apply_bgr and 'GSUB' in font:
        try:
            bgr = single_subst(font, feature_lookups(font, 'GSUB', 'locl', 'cyrl', 'BGR '))
        except ValueError:
            bgr = {}
    total = n_total = 0
    missing = []
    for ch, n in BG_COUNTS.items():
        if not n:
            continue
        g = cmap.get(ord(ch))
        if g is None:
            missing.append(ch)
            continue
        g = bgr.get(g, g)
        total += n * hm[g][0]
        n_total += n
    return total / n_total / upm, missing, len(bgr)


def vertical_metrics(font):
    upm = font['head'].unitsPerEm
    hh, os2 = font['hhea'], font['OS/2']
    use_typo = bool(os2.fsSelection & (1 << 7))
    if use_typo:
        asc, desc, gap = os2.sTypoAscender, os2.sTypoDescender, os2.sTypoLineGap
    else:
        asc, desc, gap = hh.ascent, hh.descent, hh.lineGap
    return dict(upm=upm, ascent=asc, descent=desc, lineGap=gap, use_typo_metrics=use_typo,
                hhea=[hh.ascent, hh.descent, hh.lineGap],
                typo=[os2.sTypoAscender, os2.sTypoDescender, os2.sTypoLineGap],
                win=[os2.usWinAscent, os2.usWinDescent])


def fallback_metrics(family, font_bytes, system_dir, paths):
    cfg = FAMILIES[family]
    weights = sorted({*cfg['check_weights'], *(b['tune'] for b in BANDS[family])})
    web = {}
    for w in weights:
        s = at_weight(font_bytes, w)
        avg, missing, nbgr = sample_avg_advance(s)
        web[w] = dict(avg_em=avg, missing=missing, bgr_forms_used=nbgr, vm=vertical_metrics(s))
    result = dict(web={str(w): dict(avg_advance_em=round(v['avg_em'], 5), bgr_forms_used=v['bgr_forms_used'],
                                    vertical=v['vm']) for w, v in web.items()}, fallbacks=[])
    for fb in FALLBACKS[family]:
        entry = dict(name=fb['name'], css_family=fb['css'], local=fb['local'])
        if fb.get('skip'):
            entry['skipped'] = fb['skip']
            result['fallbacks'].append(entry)
            continue
        path = paths[fb['source']] if fb.get('source') else os.path.join(system_dir, fb['file'])
        if not os.path.exists(path):
            entry['skipped'] = f'{path} not found'
            result['fallbacks'].append(entry)
            continue
        ff = TTFont(path, lazy=True)  # a variable source is measured at its default (Regular)
        favg, fmissing, fbgr = sample_avg_advance(ff)
        entry.update(file=path, version=ff['name'].getDebugName(5), avg_advance_em=round(favg, 5),
                     missing=fmissing, bgr_forms_in_fallback=fbgr)
        per_weight = {}
        for w, v in web.items():
            size_adjust = v['avg_em'] / favg
            vm = v['vm']
            per_weight[str(w)] = dict(
                size_adjust=round(100 * size_adjust, 2),
                ascent_override=round(100 * vm['ascent'] / vm['upm'] / size_adjust, 2),
                descent_override=round(100 * abs(vm['descent']) / vm['upm'] / size_adjust, 2),
                line_gap_override=round(100 * vm['lineGap'] / vm['upm'] / size_adjust, 2))
        entry['per_weight'] = per_weight
        bands = []
        for b in BANDS[family]:
            m = per_weight[str(b['tune'])]
            bands.append(dict(weight=list(b['range']), tuned_at=b['tune'], roles=b['roles'], **m))
        entry['bands'] = bands
        result['fallbacks'].append(entry)
    return result


# --------------------------------------------------------------------------------------
# CSS
# --------------------------------------------------------------------------------------


def css_weight(lo, hi):
    return f'{lo}' if lo == hi else f'{lo} {hi}'


def web_weights(cfg):
    w = cfg['limits']['wght']
    return w if isinstance(w, tuple) else (w, w)


def css_text(prefix, files, fallbacks, comment):
    lines = [f'/* {comment} */', '']
    for fam, cfg in FAMILIES.items():
        lines += ['@font-face {',
                  f'  font-family: "{cfg["css_family"]}";',
                  f'  src: url("{prefix}{files[fam]}") format("woff2");',
                  f'  font-weight: {css_weight(*web_weights(cfg))};',
                  f'  font-style: {cfg["style"]};',
                  '  font-display: swap;',
                  '}', '']
    lines += ['/* Metric-matched fallbacks: size-adjust from the average advance of a Bulgarian',
              '   letter-frequency sample (Bulgarian locl forms), overrides from the web font\'s',
              '   vertical metrics. One face per weight band, and an italic one for Display.',
              '   Faces whose local() font is not installed fail to load and the browser moves',
              '   on to the next family. The stacks are in src/index.css and tailwind.config.js. */', '']
    for fam, cfg in FAMILIES.items():
        for fb in fallbacks[fam]['fallbacks']:
            if 'bands' not in fb:
                continue
            src = ', '.join(f'local("{n}")' for n in fb['local'])
            for b in fb['bands']:
                lines += ['@font-face {',
                          f'  font-family: "{fb["css_family"]}";',
                          f'  src: {src};',
                          f'  font-weight: {css_weight(*b["weight"])};',
                          f'  font-style: {cfg["style"]};',
                          f'  size-adjust: {b["size_adjust"]:.2f}%;',
                          f'  ascent-override: {b["ascent_override"]:.2f}%;',
                          f'  descent-override: {b["descent_override"]:.2f}%;',
                          f'  line-gap-override: {b["line_gap_override"]:.2f}%;',
                          '}', '']
    return '\n'.join(lines).rstrip('\n') + '\n'


# --------------------------------------------------------------------------------------
# Main
# --------------------------------------------------------------------------------------


def kb(n):
    """kB = 1000 bytes; KiB = 1024 bytes, the budget's unit (spec section 3.1)."""
    return round(n / 1000, 1)


def kib(n):
    return round(n / 1024, 1)


def experiment(paths):
    """Marginal woff2 cost of the optional features."""
    rows = []
    for fam, cfg in FAMILIES.items():
        variants = [('as configured', FEATURES)] + [
            (f'without {x}', [y for y in FEATURES if y != x]) for x in ('kern', 'liga', 'calt', 'case')]
        for label, feats in variants:
            f, _ = build_font(paths[cfg['source']], cfg['limits'], FULL_SET, feats, cfg['freeze'])
            size = len(ship_bytes(f))
            rows.append((fam, label, size))
            log(f'{fam:15s} {label:20s} {size:7d} B  {kib(size):5.1f} KiB')
    return rows


def main():
    t0 = time.time()
    os.makedirs(ARGS.out, exist_ok=True)
    paths = fetch_sources(ARGS.src, ARGS.fetch)
    log('fontTools', FONTTOOLS_VERSION)
    if ARGS.experiment:
        experiment(paths)
        return

    report = dict(generated_by='build-fonts.py', fonttools=FONTTOOLS_VERSION, google_fonts_commit=GF_COMMIT,
                  sources={k: dict(path=SOURCES[k]['path'], url=SOURCES[k]['url'], sha256=SOURCES[k]['sha256'])
                           for k in SOURCES},
                  coverage=ranges_str(FULL_SET),
                  families={})
    for cfg in FAMILIES.values():
        if cfg['ofl']:
            with open(paths[cfg['ofl']], 'rb') as fh, open(os.path.join(ARGS.out, cfg['ofl_out']), 'wb') as out:
                out.write(fh.read())
    os.makedirs(os.path.join(ARGS.out, 'work'), exist_ok=True)

    files, shipped, versions = {}, {}, {}
    for fam, cfg in FAMILIES.items():
        log(f'[{fam}] building, limits {cfg["limits"]}')
        font, info = build_font(paths[cfg['source']], cfg['limits'], FULL_SET, FEATURES, cfg['freeze'])
        data = ship_bytes(font)
        name = cfg['out'] + '.woff2'
        with open(os.path.join(ARGS.out, name), 'wb') as fh:
            fh.write(data)
        with open(os.path.join(ARGS.out, 'work', cfg['out'] + '.named.ttf'), 'wb') as fh:
            fh.write(to_bytes(font))  # unshipped, with glyph names, for inspection
        files[fam] = name
        shipped[fam] = data
        sf = load(data)
        versions[fam] = sf['name'].getDebugName(5)
        cmap_cps = set(sf.getBestCmap())
        fam_report = dict(
            file=name, bytes=len(data), kB=kb(len(data)), KiB=kib(len(data)), sha256=hashlib.sha256(data).hexdigest(),
            version=versions[fam],
            axes={a.axisTag: [a.minValue, a.defaultValue, a.maxValue] for a in sf['fvar'].axes} if is_variable(sf) else {},
            pinned={k: v for k, v in cfg['limits'].items() if not isinstance(v, tuple)},
            glyphs=sf['maxp'].numGlyphs,
            missing_from_requested=[f'U+{c:04X}' for c in FULL_SET if c not in cmap_cps],
            features_kept=FEATURES,
            features_by_script=features_by_script(sf),
            bgr=check_bgr(font),
            digits=check_digits(data, cfg['check_weights']),
            cross_script_kerning=check_cross_kerning(sf),
            build=info,
        )
        if ARGS.copy:
            fam_report['site_copy_not_covered'] = copy_coverage(ARGS.copy, cmap_cps)
        report['families'][fam] = fam_report
        log(f'[{fam}] {name}: {len(data)} B ({kib(len(data))} KiB)')

    fb = {fam: fallback_metrics(fam, shipped[fam], ARGS.system_fonts, paths) for fam in FAMILIES}
    report['fallbacks'] = fb
    stamp = (f'Generated by build-fonts.py (fontTools {FONTTOOLS_VERSION}). Cormorant Garamond '
             f'{versions["display"].replace("Version ", "")} wght 500-600, italic wght 500; Manrope '
             f'{versions["text"].replace("Version ", "")} wght 400-600. Do not edit by hand.')
    with open(os.path.join(ARGS.out, 'fonts.css'), 'w', encoding='utf-8', newline='\n') as fh:
        fh.write(css_text(ARGS.url_prefix, files, fb, stamp))
    with open(os.path.join(ARGS.out, 'fonts.preview.css'), 'w', encoding='utf-8', newline='\n') as fh:
        fh.write(css_text('', files, fb, stamp + ' Preview copy with relative URLs.'))

    total = sum(len(v) for v in shipped.values())
    report['first_load'] = dict(
        files=[files[f] for f in FAMILIES], bytes=total, kB=kb(total), KiB=kib(total),
        budget_bytes=BUDGET_BYTES, within_budget=total <= BUDGET_BYTES, headroom_bytes=BUDGET_BYTES - total)
    problems = run_checks(report)
    report['checks'] = dict(passed=not problems, problems=problems)
    report['build_seconds'] = round(time.time() - t0, 1)
    with open(os.path.join(ARGS.out, 'font-report.json'), 'w', encoding='utf-8', newline='\n') as fh:
        json.dump(report, fh, ensure_ascii=False, indent=2)
    log(f'three faces: {total} B = {kib(total)} KiB (budget 90 KiB = {BUDGET_BYTES} B); built in {report["build_seconds"]} s')
    if problems:
        log('CHECKS FAILED:')
        for p in problems:
            log('  -', p)
        sys.exit(1)
    log('checks passed: Bulgarian forms, lining + tabular digits, coverage, features, budget')


# Requested code points a font may lack (fine: the browser falls back per character).
ALLOWED_MISSING = {'U+00AD',   # soft hyphen (Chrome hyphenates with the hyphen glyph)
                   'U+201B'}   # reversed-9 quote: unused in Bulgarian


def run_checks(report):
    """The spec's checks (section 3.1): the Bulgarian forms present and reached only
    through cyrl/BGR, lining figures by default and equal tabular ones, the kept
    features, the coverage and the 90 KiB budget."""
    problems = []
    for fam, d in report['families'].items():
        miss = set(d['missing_from_requested']) - ALLOWED_MISSING - FAMILIES[fam].get('allowed_missing', set())
        if miss:
            problems.append(f'{fam}: requested code points missing: {sorted(miss)}')
        bgr = d['bgr']
        lost = sorted(set(FAMILIES[fam]['bg_letters']) - set(bgr['letters_with_bg_forms']))
        if lost:
            problems.append(f'{fam}: Bulgarian forms missing for {"".join(lost)} ({bgr})')
        gsub, gpos = d['features_by_script']['GSUB'], d['features_by_script']['GPOS']
        if 'locl' not in gsub.get('cyrl/BGR', []) or 'locl' in gsub.get('cyrl/dflt', []):
            problems.append(f'{fam}: locl must be reachable through cyrl/BGR only')
        for feat in ('tnum', 'kern'):
            if feat not in gsub.get('cyrl/BGR', []) + gpos.get('cyrl/dflt', []):
                problems.append(f'{fam}: feature {feat} missing')
        dg = d['digits']
        if not dg['tnum_variation_identical_for_all_digits']:
            problems.append(f'{fam}: tabular digits vary differently across wght')
        for row in dg['by_weight']:
            for key in ('default_is_lining', 'tnum_equal', 'tnum_equal_hvar', 'hvar_matches_gvar', 'tnum_is_lining'):
                if not row[key]:
                    problems.append(f'{fam}: digits {key} false at wght {row["wght"]}')
    if not report['first_load']['within_budget']:
        problems.append(f'the three faces, {report["first_load"]["bytes"]} B, exceed 90 KiB')
    return problems


if __name__ == '__main__':
    main()
