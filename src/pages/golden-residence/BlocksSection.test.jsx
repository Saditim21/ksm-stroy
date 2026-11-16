import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { buildModel } from '../../explorer/model'
import { snapshotData } from '../../explorer/testing'
import { ExplorerContext } from '../../explorer/useExplorer'
import BlocksSection from './BlocksSection'

// Ruling C8.11 (Review Focus 1): the blocks keep the room of what the data
// fills, as the squares do, so nothing under #blokove moves when the data
// lands late. Before the data the room types read `—`, block А's note is
// there (spec §6.16 gives that block the note), and block Б's exposures wait
// in an empty list whose rows keep their room (gr.css). When the data lands
// those same elements fill. The page's provider is stood in for by its
// context, its model given.

const MODEL = buildModel(snapshotData())
const text = (element) => element.textContent.replace(/\s+/g, ' ').trim()
const half = (id) => document.getElementById(id)
// What a block's half holds, in order: its name, its facts, its squares, its
// counts and types, then its note or its exposures.
const shape = (id) => [...half(id).children].map((child) => `${child.tagName.toLowerCase()}.${child.className}`)

function renderBlocks(model) {
  const at = (value) => (
    <ExplorerContext.Provider value={{ model: value, openUnit: () => {} }}>
      <BlocksSection />
    </ExplorerContext.Provider>
  )
  const view = render(at(model))
  return { ...view, land: (value) => view.rerender(at(value)) }
}

describe('the blocks before the data', () => {
  it('read „—“ for the room types in both halves, with block А’s note and block Б’s exposures waiting', () => {
    renderBlocks(null)
    for (const id of ['blk-a', 'blk-b']) expect(text(half(id).querySelector('.blk__types'))).toBe('— двустайни · — тристайни · — ателиета')
    expect(text(half('blk-a').querySelector('.blk__note'))).toBe('Изложението на блок А не е попълнено в таблицата.')
    // Spec §3.3: each one-letter word bound to the word after it.
    expect(half('blk-a').querySelector('.blk__note').textContent).toContain('не е\u00a0попълнено в\u00a0таблицата')
    expect(half('blk-a').querySelector('.blk__expo')).toBeNull()
    expect(half('blk-b').querySelector('.blk__expo')).toBeEmptyDOMElement()
    expect(half('blk-b').querySelector('.blk__note')).toBeNull()
  })

  it('fill the same elements when the data lands, nothing added or taken away', () => {
    const { land } = renderBlocks(null)
    const before = [shape('blk-a'), shape('blk-b')]
    expect(before).toEqual([
      ['h3.blk__name', 'p.blk__sub', 'div.blk__floors', 'div.blk__stats', 'p.blk__note'],
      ['h3.blk__name', 'p.blk__sub', 'div.blk__floors', 'div.blk__stats', 'ul.blk__expo'],
    ])
    const types = half('blk-a').querySelector('.blk__types')
    const note = half('blk-a').querySelector('.blk__note')
    const exposures = half('blk-b').querySelector('.blk__expo')

    land(MODEL)
    expect([shape('blk-a'), shape('blk-b')]).toEqual(before)
    expect(half('blk-a').querySelector('.blk__types')).toBe(types)
    expect(text(types)).toBe('56 двустайни · 32 тристайни · 8 ателиета')
    expect(half('blk-a').querySelector('.blk__note')).toBe(note)
    expect(half('blk-b').querySelector('.blk__expo')).toBe(exposures)
    expect([...exposures.children].map(text)).toEqual(['24 юг', '24 запад', '16 изток', '8 юг/изток', '8 север', '8 север/запад', '8 запад/юг'])
  })

  // The data still decides: a block whose sheet gives exposures lists them,
  // one that gives none says so.
  it('follow the data once it is in: exposures where the sheet gives them, the note where it gives none', () => {
    const swapped = {
      ...MODEL,
      blocks: {
        'А': { ...MODEL.blocks['А'], exposure: { 'Юг': 96 } },
        'Б': { ...MODEL.blocks['Б'], exposure: {} },
      },
    }
    renderBlocks(swapped)
    expect([...half('blk-a').querySelectorAll('.blk__expo > li')].map(text)).toEqual(['96 юг'])
    expect(half('blk-a').querySelector('.blk__note')).toBeNull()
    expect(text(half('blk-b').querySelector('.blk__note'))).toBe('Изложението на блок Б не е попълнено в таблицата.')
  })
})
