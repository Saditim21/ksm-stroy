import { getMnogoAFallbackData, getMnogoBFallbackData } from './mnogofamilnaFallbackData'

test('mnogofamilna fallback data has sheet row shape for both blocks', () => {
  for (const data of [getMnogoAFallbackData(), getMnogoBFallbackData()]) {
    const floors = Object.keys(data)
    expect(floors.length).toBeGreaterThan(5)
    for (const rows of Object.values(data)) {
      for (const row of rows) {
        expect(row).toMatchObject({
          apartment: expect.stringMatching(/\S/),
          вид: expect.any(String), built: expect.any(String),
          total: expect.any(String), status: expect.stringMatching(/\S/),
        })
        expect(row.total).not.toMatch(/м²/)
      }
    }
  }
})
