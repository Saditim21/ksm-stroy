import { describe, expect, it } from 'vitest'
import { parsePrefill } from './prefill'

// What a link to Контакти's form asks it to show (spec M3/M4 §7.3, §8;
// ruling M4-PF12): the subject `?project=` names, and the apartments
// `?apartment=` names, each only if it is a unit of that subject's project,
// at most six. Without ?project= the form keeps its own first subject, Golden
// Residence, whose apartments the store knows only once its data is in.

const GR = new Set(['А 101', 'А 301', 'А 302', 'А 303', 'Б 201', 'Б 202', 'Б 203', 'Б 204'])
const MN = new Set(['А-101', 'А-301', 'Б-702', 'Б-703'])
const units = { gr: GR, mn: MN }
const gr = (label) => ({ project: 'golden-residence', label })
const mn = (label) => ({ project: 'mnogofamilna-sgrada', label })

describe('the subject', () => {
  it.each([
    ['golden-residence', 'golden-residence'],
    ['gr', 'golden-residence'],
    ['mnogofamilna-sgrada', 'mnogofamilna'],
    ['mnogofamilna', 'mnogofamilna'],
    ['mn', 'mnogofamilna'],
    ['stroitelstvo', 'build'],
    ['remont', 'build'],
    ['build', 'build'],
    ['drugo', 'other'],
    ['other', 'other'],
  ])('?project=%s chooses %s', (slug, option) => {
    expect(parsePrefill(`?project=${slug}`, units)).toEqual({ option, picks: [] })
  })

  it('?project=stroitelstvo gives build', () => {
    expect(parsePrefill('?project=stroitelstvo', units).option).toBe('build')
  })

  // Ruling M4-PF12: the slug is read in lower case first.
  it('reads the slug whatever its case', () => {
    expect(parsePrefill('?project=GR', units).option).toBe('golden-residence')
    expect(parsePrefill('?project=Stroitelstvo', units).option).toBe('build')
  })

  it('drops a slug it does not know, and chooses nothing without one', () => {
    for (const search of ['?project=apartamenti', '?project=', '?project=constructor', '?project=__proto__', '', '?view=list']) {
      expect(parsePrefill(search, units).option, search).toBeNull()
    }
  })
})

describe('the apartments', () => {
  // Latin A and B read as the Cyrillic letters the units are named by.
  it('?project=GR&apartment=A 301 gives Golden Residence’s „А 301“ once its units are in, and none before', () => {
    expect(parsePrefill('?project=GR&apartment=A 301', { gr: null, mn: MN })).toEqual({ option: 'golden-residence', picks: [] })
    expect(parsePrefill('?project=GR&apartment=A 301', units)).toEqual({ option: 'golden-residence', picks: [gr('А 301')] })
  })

  it('?apartment=Б-702 with ?project=mn gives Многофамилна’s „Б-702“', () => {
    expect(parsePrefill(`?project=mn&apartment=${encodeURIComponent('Б-702')}`, { gr: null, mn: MN }))
      .toEqual({ option: 'mnogofamilna', picks: [mn('Б-702')] })
  })

  // Without ?project= the form's first subject, Golden Residence, is chosen,
  // so the apartments are its own.
  it('takes Golden Residence’s units without ?project=', () => {
    expect(parsePrefill(`?apartment=${encodeURIComponent('А 301')}`, units)).toEqual({ option: null, picks: [gr('А 301')] })
    expect(parsePrefill(`?apartment=${encodeURIComponent('Б-702')}`, units)).toEqual({ option: null, picks: [] })
  })

  it('names each apartment as its project does, however it was written', () => {
    expect(parsePrefill('?project=mn&apartment=b702&apartment=A.301', units).picks).toEqual([mn('Б-702'), mn('А-301')])
    expect(parsePrefill('?apartment=a-301&apartment=b 201', units).picks).toEqual([gr('А 301'), gr('Б 201')])
  })

  it('drops an unknown unit, a unit of the other project and one named twice', () => {
    const search = ['А 999', 'Б-702', 'А 301', 'a 301', 'Б 2O1'].map((label) => `apartment=${encodeURIComponent(label)}`).join('&')
    expect(parsePrefill(`?project=gr&${search}`, units).picks).toEqual([gr('А 301')])
  })

  it('keeps no apartment for construction or anything else', () => {
    expect(parsePrefill(`?project=stroitelstvo&apartment=${encodeURIComponent('А 301')}`, units)).toEqual({ option: 'build', picks: [] })
    expect(parsePrefill(`?project=drugo&apartment=${encodeURIComponent('А 301')}`, units)).toEqual({ option: 'other', picks: [] })
  })

  it('keeps six at most, and drops the seventh', () => {
    const seven = ['А 101', 'А 301', 'А 302', 'А 303', 'Б 201', 'Б 202', 'Б 203']
    const { picks } = parsePrefill(`?${seven.map((label) => `apartment=${encodeURIComponent(label)}`).join('&')}`, units)
    expect(picks).toEqual(seven.slice(0, 6).map(gr))
  })
})
