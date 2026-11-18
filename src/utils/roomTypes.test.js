// @vitest-environment node
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, it } from 'vitest'
import { TYPE_WORDS, typeWord } from './roomTypes'

// The room types' words, one table for the pages that count rooms (Golden
// Residence's and Многофамилна's blocks, Продажби's rows; the M4 Task 3
// review's minor, taken in Task 7): each page had its own copy.

it('counts each room type in words, and leaves a type it does not know as the sheet writes it', () => {
  expect(Object.keys(TYPE_WORDS)).toEqual(['2-стаен', '3-стаен', 'Ателие'])
  expect(typeWord('2-стаен', 1)).toBe('двустаен')
  expect(typeWord('2-стаен', 56)).toBe('двустайни')
  expect(typeWord('3-стаен', 36)).toBe('тристайни')
  expect(typeWord('Ателие', 1)).toBe('ателие')
  expect(typeWord('Ателие', 8)).toBe('ателиета')
  expect(typeWord('Мезонет', 2)).toBe('Мезонет')
})

it('is the site’s only table of the room types’ words', () => {
  const src = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
  const files = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(dir, entry.name)
    if (entry.isDirectory()) return files(file)
    return /\.jsx?$/.test(entry.name) && !/\.test\./.test(entry.name) ? [file] : []
  })
  const tables = files(src).filter((file) => /['"]тристайни['"]/.test(fs.readFileSync(file, 'utf8')))
  expect(tables.map((file) => path.relative(src, file).replace(/\\/g, '/'))).toEqual(['utils/roomTypes.js'])
})
