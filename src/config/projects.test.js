import { PROJECTS } from './projects'
import { findFloorMap } from '../utils/buildingMaps'

test('every configured floor has a floor map and a plan image', () => {
  for (const project of Object.values(PROJECTS)) {
    for (const block of project.blocks) {
      for (const floor of project.floors[block.id]) {
        expect(
          findFloorMap(project.floorMaps, project.id, block.letter, floor),
          `${project.id} ${block.id} floor ${floor} has no floor map`,
        ).not.toBeNull()
        expect(
          project.planImages[block.id][floor],
          `${project.id} ${block.id} floor ${floor} has no plan image`,
        ).toBeTruthy()
      }
    }
    expect(project.building.map.shapes.length).toBeGreaterThan(0)
  }
})

test('the facade map covers exactly the configured blocks and floors', () => {
  for (const project of Object.values(PROJECTS)) {
    const mapped = new Set(project.building.map.shapes.map((s) => `${s.block}:${s.floor}`))
    for (const block of project.blocks) {
      for (const floor of project.floors[block.id]) {
        expect(mapped.has(`${block.letter}:${floor}`), `${project.id} facade lacks ${block.letter}:${floor}`).toBe(true)
      }
    }
    const configured = new Set(
      project.blocks.flatMap((b) => project.floors[b.id].map((f) => `${b.letter}:${f}`)),
    )
    for (const key of mapped) {
      expect(configured.has(key), `${project.id} facade has unconfigured band ${key}`).toBe(true)
    }
  }
})

test('unitFloor maps display floors onto the unit-id floor digit', () => {
  expect(PROJECTS['golden-residence'].unitFloor(1)).toBe(1)
  expect(PROJECTS['golden-residence'].unitFloor(8)).toBe(8)
  expect(PROJECTS['mnogofamilna-sgrada'].unitFloor(2)).toBe(1)
  expect(PROJECTS['mnogofamilna-sgrada'].unitFloor(10)).toBe(9)
})

test('the base image dims mirror the building map coordinate space', () => {
  for (const project of Object.values(PROJECTS)) {
    expect(project.building.image.src).toBeTruthy()
    expect(project.building.image.width).toBe(project.building.map.imageWidth)
    expect(project.building.image.height).toBe(project.building.map.imageHeight)
  }
})
