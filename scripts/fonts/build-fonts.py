#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
build-fonts.py - KSM Stroy redesign v2: self-hosted Playfair (display) and
Geologica (text/UI) with Bulgarian letterforms (design spec section 3.2).

Sources (pinned, sha256-checked) are the canonical Google Fonts variable masters,
the same font versions that @fontsource-variable/playfair@5.3.0 (Playfair 2.203)
and @fontsource-variable/geologica@5.3.0 (Geologica 1.010) ship, but unsplit.
Fontsource ships each script as a separate file, so neither file contains the
kerning between Cyrillic letters and punctuation (for example "У," or "„С").
Building one file from the full master keeps those pairs.

Pipeline, per family:
  1. keep only the language systems we use (cyrl default = Russian forms, cyrl/BGR);
     drop Playfair's calt arrow ligatures (-> etc.; the site draws arrows as SVG);
  2. pre-subset to the coverage below, so instancing is fast;
  3. fontTools instancer: Playfair opsz pinned (default 72, chosen from a 72/96/120
     comparison), wdth 100, wght limited to 400-560 and kept variable;
     Geologica CRSV/SHRP/slnt pinned at 0, wght limited to 300-600;
  4. Playfair: freeze lnum into the cmap (digits, % + - x = < > ^ ~ +- map to their
     lining forms), so figures are never old-style; tnum stays a live feature;
  5. final subset: features ccmp locl rlig/rvrn calt liga kern mark mkmk tnum case,
     no hinting, no glyph names, name IDs 0-6 + 13/14 (OFL);
  6. tabular-digit fix (a no-op unless needed): Geologica's tabular six drifts 2-5
     units wider than the other tabular digits; it gets their advance;
  7. checks (Bulgarian forms, lining + tabular digits via gvar and HVAR, coverage,
     cross-script kerning) and fallback metrics; exits 1 if a check fails.

Outputs (in --out, default ./dist):
  playfair-display.woff2       Playfair, opsz pinned (display), wdth 100,
                               wght 400-560 variable, lining figures frozen as
                               the default, Cyrillic + Latin + punctuation in ONE file
  geologica-text.woff2         Geologica, CRSV/SHRP/slnt pinned at 0,
                               wght 300-600 variable, same coverage, ONE file
  split/*.woff2                the same instances split Cyrillic / Latin (comparison only)
  compare/playfair-opszNN.woff2  opsz candidates for the specimen
  fonts.css                    @font-face rules for /fonts/ + metric-matched fallbacks
  fonts.preview.css            the same with relative URLs, for the local specimens
  font-report.json             sizes, features, checks and fallback numbers
  OFL-*.txt                    licences that must travel with the fonts
  work/                        unshipped inspection copies (with glyph names)

Usage (isolated mode; fontTools 4.68 + brotli importable, or via --pylib):
  python -I -X utf8 build-fonts.py --pylib ../_py --fetch
  python -I -X utf8 build-fonts.py --pylib ../_py --experiment   # marginal byte costs
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
ap.add_argument('--opsz', type=float, default=72,
                help='Playfair display optical size to pin (default 72, chosen from the 72/96/120 comparison)')
ap.add_argument('--compare-opsz', default='72,96,120', help='extra Playfair instances for the opsz specimen')
ap.add_argument('--url-prefix', default='/fonts/', help='URL prefix used in fonts.css')
ap.add_argument('--system-fonts', default='C:/Windows/Fonts', help='folder with the local fallback fonts')
ap.add_argument('--fontsource', help='folder holding unpacked @fontsource-variable packages '
                '(playfair/package, geologica/package) for the provenance check')
ap.add_argument('--copy', nargs='*', default=[], help='folders whose text must be covered by the subset')
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
GF = 'https://raw.githubusercontent.com/google/fonts'
GF_PLAYFAIR = GF + '/8b0a1d0f5983c89bc2b93f1b5fb55f9e252744b5/ofl/playfair/'
GF_GEOLOGICA = GF + '/a60a77e14f28abd4ef243a1b5dfc48df0cec5205/ofl/geologica/'
SOURCES = {
    'playfair': dict(path='gf-playfair/Playfair[opsz,wdth,wght].ttf',
                     url=GF_PLAYFAIR + 'Playfair%5Bopsz%2Cwdth%2Cwght%5D.ttf',
                     sha256='33cfecbc9948cf9eafe54dc9f36d19a03b393cf12221b20be235926d1ca1db61'),
    'playfair-ofl': dict(path='gf-playfair/OFL.txt', url=GF_PLAYFAIR + 'OFL.txt',
                         sha256='7d16bbb17375beefaa4d1d25c41f860cb161c9e614b44af790983a9fd7102627'),
    'geologica': dict(path='gf-geologica/Geologica[CRSV,SHRP,slnt,wght].ttf',
                      url=GF_GEOLOGICA + 'Geologica%5BCRSV%2CSHRP%2Cslnt%2Cwght%5D.ttf',
                      sha256='9124d9e88ac6c11d761f35241713a51d68e2c4ebedce0edaca834717a00959ec'),
    'geologica-ofl': dict(path='gf-geologica/OFL.txt', url=GF_GEOLOGICA + 'OFL.txt',
                          sha256='778186245840aea0e60bec6a46e7fb1442e0cd78e41afeadffcd3e8824b379e0'),
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
SPLIT_CYRILLIC = sorted(set(CYRILLIC + COMBINING))
SPLIT_LATIN = sorted(set(FULL_SET) - set(SPLIT_CYRILLIC))

KEEP_SCRIPTS = ['DFLT', 'cyrl', 'latn']
KEEP_LANGSYS = {'cyrl': {'BGR '}, 'latn': set(), 'DFLT': set()}  # Russian etc. = cyrl default

FAMILIES = {
    # rlig (Playfair) and rvrn (Geologica) carry the fonts' FeatureVariations glyph swaps.
    'playfair': dict(
        source='playfair', ofl='playfair-ofl', ofl_out='OFL-Playfair.txt', out='playfair-display',
        css_family='Playfair', weights=(400, 560), freeze='lnum',
        features=['ccmp', 'locl', 'rlig', 'calt', 'liga', 'kern', 'mark', 'mkmk', 'tnum', 'case'],
        check_weights=[400, 420, 480, 500, 560]),   # counts 400, h1 420, h2 480, h3 500
    'geologica': dict(
        source='geologica', ofl='geologica-ofl', ofl_out='OFL-Geologica.txt', out='geologica-text',
        css_family='Geologica', weights=(300, 600), freeze=None,
        features=['ccmp', 'locl', 'rvrn', 'calt', 'liga', 'kern', 'mark', 'mkmk', 'tnum', 'case'],
        check_weights=[300, 400, 500, 600]),        # body 400, labels 500
}


def playfair_limits(opsz):
    return {'opsz': float(opsz), 'wdth': 100.0, 'wght': (400, 560)}


GEOLOGICA_LIMITS = {'CRSV': 0.0, 'SHRP': 0.0, 'slnt': 0.0, 'wght': (300, 600)}

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

# Fallback faces. Weight bands: each band gets its own metric-matched @font-face, tuned at
# the weight of the role that uses it most.
FALLBACKS = {
    'playfair': [
        dict(name='Georgia', css='Playfair Fallback Georgia', file='georgia.ttf', local=['Georgia']),
        dict(name='Times New Roman', css='Playfair Fallback Times', file='times.ttf',
             local=['Times New Roman', 'TimesNewRomanPSMT']),
    ],
    'geologica': [
        dict(name='Segoe UI', css='Geologica Fallback Segoe', file='segoeui.ttf', local=['Segoe UI', 'SegoeUI']),
        dict(name='Arial', css='Geologica Fallback Arial', file='arial.ttf', local=['Arial', 'ArialMT']),
        dict(name='Helvetica Neue', css=None, file=None, local=['Helvetica Neue'],
             skip='macOS/iOS only: no Cyrillic advance data available here and none is published '
                  '(capsize metrics are Latin-weighted). Arial ships on macOS and iOS, so the Arial '
                  'face covers Apple platforms with measured numbers.'),
    ],
}
BANDS = {
    'playfair': [dict(range=(400, 449), tune=420, roles='h1 (420), counts (400)'),
                 dict(range=(450, 560), tune=490, roles='h2 (480), h3 (500)')],
    'geologica': [dict(range=(300, 449), tune=400, roles='body, small (400)'),
                  dict(range=(450, 600), tune=500, roles='labels, buttons (500)')],
}

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


def drop_calt_ligatures(font):
    """Playfair's calt has a ligature lookup that turns -> <- ^- into arrows. The site draws
    its arrows as SVG and the subset has no arrows, so remove that lookup from calt
    (the contextual case-punctuation lookups in calt stay)."""
    gsub = font['GSUB'].table
    removed = []
    for fr in gsub.FeatureList.FeatureRecord:
        if fr.FeatureTag != 'calt':
            continue
        keep = []
        for li in fr.Feature.LookupListIndex:
            lk = gsub.LookupList.Lookup[li]
            t = lk.LookupType if lk.LookupType != 7 else lk.SubTable[0].ExtSubTable.LookupType
            if t == 4:
                removed.append(li)
            else:
                keep.append(li)
        fr.Feature.LookupListIndex = keep
        fr.Feature.LookupCount = len(keep)
    return sorted(set(removed))


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
    """Geologica's tabular six is 2 units wider than the other tabular digits at wght 300 and
    drifts to +5 units (of 2000) at 600; the others stay at 1296. Give every tabular digit the
    default advance and the advance variation of the majority, so tnum digits are equal at
    every weight, then rebuild HVAR from gvar. A no-op when they already agree (Playfair).
    Refuses anything bigger than a drift of 1% of the em."""
    from fontTools.varLib.hvar import add_HVAR
    glyphs = tabular_digit_glyphs(font)
    hm = font['hmtx']
    upm = font['head'].unitsPerEm
    adv = collections.Counter(hm[g][0] for g in glyphs).most_common(1)[0][0]
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
        hm[g] = (adv, hm[g][1])  # outline untouched; the right side bearing absorbs the 2 units
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
    info = {'calt_ligature_lookups_removed': drop_calt_ligatures(f)}
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


# --------------------------------------------------------------------------------------
# Checks
# --------------------------------------------------------------------------------------


def glyph_signature(font, name):
    glyf = font['glyf']
    coords, ends, _ = glyf[name].getCoordinates(glyf)
    return tuple(coords), tuple(ends), font['hmtx'][name][0]


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


def check_digits(font_bytes, weights):
    rows = []
    vf = load(font_bytes)
    vf_tab = tabular_digit_glyphs(vf)
    vf_cmap = vf.getBestCmap()
    vf_default = [vf_cmap[0x30 + i] for i in range(10)]
    sigs = {tuple(sorted(advance_signature(vf, g).items())) for g in vf_tab}
    for w in weights:
        hv_tab = hvar_advances(vf, vf_tab, w)
        hv_def = hvar_advances(vf, vf_default, w)
        s = instancer.instantiateVariableFont(load(font_bytes), {'wght': w}, inplace=False)
        cmap, hm, glyf = s.getBestCmap(), s['hmtx'], s['glyf']
        upm = s['head'].unitsPerEm
        dflt = [cmap[0x30 + i] for i in range(10)]
        tnum = single_subst(s, feature_lookups(s, 'GSUB', 'tnum'))
        tab = [tnum.get(g, g) for g in dflt]

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
    return dict(tnum_variation_identical_for_all_digits=len(sigs) == 1, by_weight=rows)


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


def feature_variations(font):
    gsub = font['GSUB'].table
    fv = getattr(gsub, 'FeatureVariations', None)
    if not fv:
        return []
    axes = [a.axisTag for a in font['fvar'].axes]
    out = []
    for r in fv.FeatureVariationRecord:
        conds = []
        if r.ConditionSet:
            for c in r.ConditionSet.ConditionTable:
                conds.append(f'{axes[c.AxisIndex]} {c.FilterRangeMinValue:.3f}..{c.FilterRangeMaxValue:.3f}')
        subs = {}
        for sr in r.FeatureTableSubstitution.SubstitutionRecord:
            lks = sr.Feature.LookupListIndex
            m = {}
            for li in lks:
                lk = gsub.LookupList.Lookup[li]
                for st in lk.SubTable:
                    if hasattr(st, 'mapping'):
                        m.update(st.mapping)
            subs[gsub.FeatureList.FeatureRecord[sr.FeatureIndex].FeatureTag] = m
        out.append(dict(conditions=conds or ['always'], substitutions=subs))
    return out


def copy_coverage(dirs, cmap_cps):
    """Characters used in the site copy that the subset does not cover."""
    exts = {'.js', '.jsx', '.ts', '.tsx', '.html', '.json', '.md', '.csv', '.mjs'}
    skip = {'node_modules', '.git', 'dist', 'build', '.vercel', 'docs', 'coverage'}
    cnt = collections.Counter()
    for root in dirs:
        for dp, dns, fns in os.walk(root):
            dns[:] = [d for d in dns if d not in skip]
            for fn in fns:
                if os.path.splitext(fn)[1].lower() in exts:
                    try:
                        with open(os.path.join(dp, fn), encoding='utf-8') as fh:
                            cnt.update(fh.read())
                    except (UnicodeDecodeError, OSError):
                        pass
    missing = {f'U+{ord(c):04X}': n for c, n in sorted(cnt.items()) if ord(c) >= 0x20 and ord(c) not in cmap_cps
               and ord(c) not in (0x2028, 0x2029)}
    return missing


def provenance_check(fs_dir, family, src_path):
    """Compare the canonical master with the fontsource 5.3.0 'standard' (all-axes) files."""
    names = {'playfair': ['playfair/package/files/playfair-cyrillic-standard-normal.woff2',
                          'playfair/package/files/playfair-latin-standard-normal.woff2'],
             'geologica': ['geologica/package/files/geologica-cyrillic-full-normal.woff2',
                           'geologica/package/files/geologica-latin-full-normal.woff2']}[family]
    master = TTFont(src_path)
    mg, mh, mv = master['glyf'], master['hmtx'], master['gvar'].variations
    out = []
    for rel in names:
        p = os.path.join(fs_dir, rel)
        if not os.path.exists(p):
            out.append(dict(file=rel, error='missing'))
            continue
        fs = TTFont(p)  # woff2 is decompressed by fontTools (brotli)
        fg, fh, fv = fs['glyf'], fs['hmtx'], fs['gvar'].variations
        same = diff = 0
        diffs = []
        for g in fs.getGlyphOrder():
            if g == '.notdef' or g not in mh.metrics:
                continue
            a = (fg[g].getCoordinates(fg)[0], fh[g][0])
            b = (mg[g].getCoordinates(mg)[0], mh[g][0])
            va = [(tuple(sorted(t.axes.items())), tuple(t.coordinates)) for t in fv.get(g, [])]
            vb = [(tuple(sorted(t.axes.items())), tuple(t.coordinates)) for t in mv.get(g, [])]
            if a == b and va == vb:
                same += 1
            else:
                diff += 1
                diffs.append(g)
        out.append(dict(file=rel, version=fs['name'].getDebugName(5), glyphs_identical=same,
                        glyphs_different=diff, examples=diffs[:8]))
    return dict(master_version=master['name'].getDebugName(5), files=out)


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


def fallback_metrics(family, font_bytes, system_dir):
    cfg = FAMILIES[family]
    weights = sorted({*cfg['check_weights'], *(b['tune'] for b in BANDS[family])})
    web = {}
    for w in weights:
        s = instancer.instantiateVariableFont(load(font_bytes), {'wght': w}, inplace=False)
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
        path = os.path.join(system_dir, fb['file'])
        if not os.path.exists(path):
            entry['skipped'] = f'{path} not found'
            result['fallbacks'].append(entry)
            continue
        ff = TTFont(path, lazy=True)
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


def css_text(prefix, files, fallbacks, comment):
    pf, geo = FAMILIES['playfair'], FAMILIES['geologica']
    lines = [f'/* {comment} */', '']
    for fam, cfg in (('playfair', pf), ('geologica', geo)):
        lo, hi = cfg['weights']
        lines += ['@font-face {',
                  f'  font-family: "{cfg["css_family"]}";',
                  f'  src: url("{prefix}{files[fam]}") format("woff2");',
                  f'  font-weight: {lo} {hi};',
                  '  font-style: normal;',
                  '  font-display: swap;',
                  '}', '']
    lines += ['/* Metric-matched fallbacks: size-adjust from the average advance of a Bulgarian',
              '   letter-frequency sample (Bulgarian locl forms), overrides from the web font\'s',
              '   vertical metrics. One face per weight band. Faces whose local() font is not',
              '   installed fail to load and the browser moves on to the next family. */', '']
    stacks = {}
    for fam in ('playfair', 'geologica'):
        names = []
        for fb in fallbacks[fam]['fallbacks']:
            if 'bands' not in fb:
                continue
            names.append(fb['css_family'])
            src = ', '.join(f'local("{n}")' for n in fb['local'])
            for b in fb['bands']:
                lines += ['@font-face {',
                          f'  font-family: "{fb["css_family"]}";',
                          f'  src: {src};',
                          f'  font-weight: {b["weight"][0]} {b["weight"][1]};',
                          '  font-style: normal;',
                          f'  size-adjust: {b["size_adjust"]:.2f}%;',
                          f'  ascent-override: {b["ascent_override"]:.2f}%;',
                          f'  descent-override: {b["descent_override"]:.2f}%;',
                          f'  line-gap-override: {b["line_gap_override"]:.2f}%;',
                          '}', '']
        stacks[fam] = names
    pf_stack = ', '.join([f'"{pf["css_family"]}"'] + [f'"{n}"' for n in stacks['playfair']] + ['serif'])
    geo_stack = ', '.join([f'"{geo["css_family"]}"'] + [f'"{n}"' for n in stacks['geologica']] + ['sans-serif'])
    lines += [':root {',
              f'  --font-display: {pf_stack};',
              f'  --font-text: {geo_stack};',
              '}', '']
    return '\n'.join(lines)


# --------------------------------------------------------------------------------------
# Main
# --------------------------------------------------------------------------------------


def kb(n):
    """kB = 1000 bytes (the budget unit); KiB is reported alongside where it matters."""
    return round(n / 1000, 1)


def kib(n):
    return round(n / 1024, 1)


def experiment(paths):
    """Marginal woff2 cost of optional features and coverage, at the chosen opsz."""
    rows = []
    base_pf = FAMILIES['playfair']['features']
    base_geo = FAMILIES['geologica']['features']
    variants = [
        ('playfair', 'as configured', base_pf, FULL_SET),
        ('playfair', 'without liga', [x for x in base_pf if x != 'liga'], FULL_SET),
        ('playfair', 'without calt', [x for x in base_pf if x != 'calt'], FULL_SET),
        ('playfair', 'without case', [x for x in base_pf if x != 'case'], FULL_SET),
        ('playfair', 'without kern', [x for x in base_pf if x != 'kern'], FULL_SET),
        ('playfair', 'without combining marks', base_pf, sorted(set(FULL_SET) - set(COMBINING))),
        ('playfair', 'only the task list (no ccmp/calt/liga/rlig)',
         ['locl', 'kern', 'mark', 'mkmk', 'tnum', 'case'], FULL_SET),
        ('geologica', 'as configured', base_geo, FULL_SET),
        ('geologica', 'without liga', [x for x in base_geo if x != 'liga'], FULL_SET),
        ('geologica', 'without calt', [x for x in base_geo if x != 'calt'], FULL_SET),
        ('geologica', 'without case', [x for x in base_geo if x != 'case'], FULL_SET),
        ('geologica', 'without combining marks', base_geo, sorted(set(FULL_SET) - set(COMBINING))),
    ]
    for fam, label, feats, uni in variants:
        cfg = FAMILIES[fam]
        limits = playfair_limits(ARGS.opsz) if fam == 'playfair' else GEOLOGICA_LIMITS
        f, _ = build_font(paths[cfg['source']], limits, uni, feats, cfg['freeze'])
        size = len(ship_bytes(f))
        rows.append((fam, label, size))
        log(f'{fam:10s} {label:45s} {size:7d} B  {kb(size):5.1f} kB')
    return rows


def main():
    t0 = time.time()
    os.makedirs(ARGS.out, exist_ok=True)
    paths = fetch_sources(ARGS.src, ARGS.fetch)
    log('fontTools', FONTTOOLS_VERSION)
    if ARGS.experiment:
        experiment(paths)
        return

    report = dict(generated_by='build-fonts.py', fonttools=FONTTOOLS_VERSION,
                  sources={k: dict(path=SOURCES[k]['path'], url=SOURCES[k]['url'], sha256=SOURCES[k]['sha256'])
                           for k in SOURCES},
                  coverage=dict(single_file=ranges_str(FULL_SET), split_cyrillic=ranges_str(SPLIT_CYRILLIC),
                                split_latin=ranges_str(SPLIT_LATIN)),
                  families={})
    for cfg in FAMILIES.values():
        with open(paths[cfg['ofl']], 'rb') as fh, open(os.path.join(ARGS.out, cfg['ofl_out']), 'wb') as out:
            out.write(fh.read())

    os.makedirs(os.path.join(ARGS.out, 'split'), exist_ok=True)
    os.makedirs(os.path.join(ARGS.out, 'compare'), exist_ok=True)
    os.makedirs(os.path.join(ARGS.out, 'work'), exist_ok=True)

    files = {}
    shipped = {}
    for fam, cfg in FAMILIES.items():
        limits = playfair_limits(ARGS.opsz) if fam == 'playfair' else GEOLOGICA_LIMITS
        log(f'[{fam}] building single file, limits {limits}')
        font, info = build_font(paths[cfg['source']], limits, FULL_SET, cfg['features'], cfg['freeze'])
        data = ship_bytes(font)
        name = cfg['out'] + '.woff2'
        with open(os.path.join(ARGS.out, name), 'wb') as fh:
            fh.write(data)
        with open(os.path.join(ARGS.out, 'work', cfg['out'] + '.named.ttf'), 'wb') as fh:
            fh.write(to_bytes(font))  # unshipped, with glyph names, for inspection
        files[fam] = name
        shipped[fam] = data
        sf = load(data)
        cmap_cps = set(sf.getBestCmap())
        fam_report = dict(
            file=name, bytes=len(data), kB=kb(len(data)), KiB=kib(len(data)), sha256=hashlib.sha256(data).hexdigest(),
            axes={a.axisTag: [a.minValue, a.defaultValue, a.maxValue] for a in sf['fvar'].axes},
            pinned={k: v for k, v in limits.items() if not isinstance(v, tuple)},
            glyphs=sf['maxp'].numGlyphs,
            missing_from_requested=[f'U+{c:04X}' for c in FULL_SET if c not in cmap_cps],
            features_kept=cfg['features'],
            features_by_script=features_by_script(sf),
            bgr=check_bgr(font),
            digits=check_digits(data, cfg['check_weights']),
            cross_script_kerning=check_cross_kerning(sf),
            feature_variations=feature_variations(sf),
            build=info,
        )
        # two-file split, same instance, for comparison
        split = {}
        for part, uni in (('cyrillic', SPLIT_CYRILLIC), ('latin', SPLIT_LATIN)):
            pfont, _ = build_font(paths[cfg['source']], limits, uni, cfg['features'], cfg['freeze'])
            pdata = ship_bytes(pfont)
            pname = f'{cfg["out"]}-{part}.woff2'
            with open(os.path.join(ARGS.out, 'split', pname), 'wb') as fh:
                fh.write(pdata)
            split[part] = dict(file='split/' + pname, bytes=len(pdata), kB=kb(len(pdata)),
                               unicode_range=ranges_str(uni))
        split['total_bytes'] = split['cyrillic']['bytes'] + split['latin']['bytes']
        split['total_kB'] = kb(split['total_bytes'])
        fam_report['split'] = split
        if ARGS.fontsource:
            fam_report['provenance_vs_fontsource'] = provenance_check(ARGS.fontsource, fam, paths[cfg['source']])
        if ARGS.copy:
            fam_report['site_copy_not_covered'] = copy_coverage(ARGS.copy, cmap_cps)
        report['families'][fam] = fam_report
        log(f'[{fam}] {name}: {len(data)} B ({kb(len(data))} kB); split {split["cyrillic"]["bytes"]} + '
            f'{split["latin"]["bytes"]} = {split["total_bytes"]} B')

    # Playfair opsz candidates (same pipeline, single file)
    cands = {}
    for o in [float(x) for x in ARGS.compare_opsz.split(',') if x.strip()]:
        f, _ = build_font(paths['playfair'], playfair_limits(o), FULL_SET, FAMILIES['playfair']['features'], 'lnum')
        d = ship_bytes(f)
        nm = f'playfair-opsz{int(o)}.woff2'
        with open(os.path.join(ARGS.out, 'compare', nm), 'wb') as fh:
            fh.write(d)
        cands[nm] = dict(opsz=o, bytes=len(d), kB=kb(len(d)))
    report['playfair_opsz_candidates'] = cands

    # fallbacks + CSS
    fb = {fam: fallback_metrics(fam, shipped[fam], ARGS.system_fonts) for fam in FAMILIES}
    report['fallbacks'] = fb
    stamp = (f'Generated by build-fonts.py (fontTools {FONTTOOLS_VERSION}). Playfair 2.203 opsz {ARGS.opsz:g} '
             f'wdth 100 wght 400-560; Geologica 1.010 wght 300-600. Do not edit by hand.')
    with open(os.path.join(ARGS.out, 'fonts.css'), 'w', encoding='utf-8', newline='\n') as fh:
        fh.write(css_text(ARGS.url_prefix, files, fb, stamp))
    with open(os.path.join(ARGS.out, 'fonts.preview.css'), 'w', encoding='utf-8', newline='\n') as fh:
        fh.write(css_text('', files, fb, stamp + ' Preview copy with relative URLs.'))

    total = sum(len(v) for v in shipped.values())
    report['first_load'] = dict(
        files=[files['playfair'], files['geologica']], bytes=total, kB=kb(total), KiB=kib(total),
        budget_kB=90, within_budget=total <= 90 * 1000, headroom_bytes=90 * 1000 - total)
    problems = run_checks(report)
    report['checks'] = dict(passed=not problems, problems=problems)
    report['build_seconds'] = round(time.time() - t0, 1)
    with open(os.path.join(ARGS.out, 'font-report.json'), 'w', encoding='utf-8', newline='\n') as fh:
        json.dump(report, fh, ensure_ascii=False, indent=2)
    log(f'first load: {total} B = {kb(total)} kB = {kib(total)} KiB (budget 90 kB); built in {report["build_seconds"]} s')
    if problems:
        log('CHECKS FAILED:')
        for p in problems:
            log('  -', p)
        sys.exit(1)
    log('checks passed: Bulgarian forms, lining + tabular digits (gvar and HVAR), coverage, features, budget')


# Requested code points the fonts do not have (fine: the browser falls back per character).
ALLOWED_MISSING = {'U+00AD',   # soft hyphen: Playfair has none (Chrome hyphenates with the hyphen glyph)
                   'U+201B'}   # reversed-9 quote: in neither font, unused in Bulgarian


def run_checks(report):
    """The spec's CI checks (section 3.2): equal digit advances and the BGR forms present,
    plus coverage, the kept features and the first-load budget."""
    problems = []
    for fam, d in report['families'].items():
        miss = set(d['missing_from_requested']) - ALLOWED_MISSING
        if miss:
            problems.append(f'{fam}: requested code points missing: {sorted(miss)}')
        bgr = d['bgr']
        if bgr['bgr_substitutions'] < 15 or bgr['identical_outlines']:
            problems.append(f'{fam}: Bulgarian forms missing or identical ({bgr})')
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
        problems.append(f'first-load fonts {report["first_load"]["bytes"]} B exceed 90 kB')
    return problems


if __name__ == '__main__':
    main()
