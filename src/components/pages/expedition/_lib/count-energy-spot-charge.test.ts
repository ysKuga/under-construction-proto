import { ItemInstance } from '../_stores/items/types'

import { countEnergySpotCharge } from './count-energy-spot-charge'

const SPOT: ItemInstance = {
  amount: 1,
  cell: { q: 0, r: 3 },
  id: 'spot-1',
  kind: 'energy-charge',
  stock: 4,
}

test('上限までの不足分とスポットの残量の小さい方を返す', () => {
  expect(countEnergySpotCharge(SPOT, { current: 8, max: 10 })).toBe(2)
  expect(countEnergySpotCharge(SPOT, { current: 0, max: 10 })).toBe(4)
})

test('上限に達していれば 0 を返す', () => {
  expect(countEnergySpotCharge(SPOT, { current: 10, max: 10 })).toBe(0)
})

test('EN スポットでなければ 0 を返す', () => {
  const item: ItemInstance = { ...SPOT, stock: undefined }

  expect(countEnergySpotCharge(item, { current: 0, max: 10 })).toBe(0)
  expect(countEnergySpotCharge(undefined, { current: 0, max: 10 })).toBe(0)
})
