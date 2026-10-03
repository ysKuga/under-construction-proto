import { ItemInstance } from '../_stores/items/types'

import { countEnergySpotRecovery } from './count-energy-spot-recovery'

const SPOT: ItemInstance = {
  amount: 1,
  cell: { q: 0, r: 3 },
  id: 'spot-1',
  kind: 'energy-recovery',
  stock: 4,
}

test('上限までの不足分とスポットの残量の小さい方を返す', () => {
  expect(countEnergySpotRecovery(SPOT, { current: 8, max: 10 })).toBe(2)
  expect(countEnergySpotRecovery(SPOT, { current: 0, max: 10 })).toBe(4)
})

test('上限に達していれば 0 を返す', () => {
  expect(countEnergySpotRecovery(SPOT, { current: 10, max: 10 })).toBe(0)
})

test('EN スポットでなければ 0 を返す', () => {
  const item: ItemInstance = { ...SPOT, stock: undefined }

  expect(countEnergySpotRecovery(item, { current: 0, max: 10 })).toBe(0)
  expect(countEnergySpotRecovery(undefined, { current: 0, max: 10 })).toBe(0)
})
