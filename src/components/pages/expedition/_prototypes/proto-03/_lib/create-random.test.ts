import { expect, test } from 'vitest'

import { createRandom } from './create-random'

/** 乱数列の先頭 n 個を取り出す */
const take = (random: () => number, n: number): number[] =>
  Array.from({ length: n }, () => random())

test('同じ seed からは同じ乱数列を返す', () => {
  expect(take(createRandom(42), 5)).toEqual(take(createRandom(42), 5))
})

test('seed が違えば乱数列も変わる', () => {
  expect(take(createRandom(1), 5)).not.toEqual(take(createRandom(2), 5))
})

test('[0, 1) の範囲の値を返す', () => {
  const values = take(createRandom(123), 1000)

  expect(values.every((value) => value >= 0 && value < 1)).toBe(true)
})
