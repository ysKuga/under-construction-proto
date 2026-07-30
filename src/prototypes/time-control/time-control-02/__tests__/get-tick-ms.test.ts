import { BASE_TICK_MS, getTickMs } from '../_lib/get-tick-ms'

test('tickMs は BASE_TICK_MS / agility になる', () => {
  expect(getTickMs(2)).toBe(BASE_TICK_MS / 2)
  expect(getTickMs(4)).toBe(BASE_TICK_MS / 4)
})

test('agility が高いほど tickMs は短くなる', () => {
  expect(getTickMs(4)).toBeLessThan(getTickMs(2))
})
