import { expect, test } from 'vitest'

import { createFogStore } from './store'
import { FogMode } from './types'

const START = { q: 0, r: 0 }
/** START の視界外 */
const FAR = { q: 3, r: 2 }
/** FAR の隣接 */
const NEAR_FAR = { q: 3, r: 1 }

const create = (initialMode: FogMode) =>
  createFogStore({ initialMode, partialFogCells: [FAR], startCell: START })

test('all-visible は全セルを表示する', () => {
  const store = create('all-visible')

  expect(store.getState().isVisible(FAR)).toBe(true)
})

test('all-hidden は視界外を非表示にする', () => {
  const store = create('all-hidden')

  expect(store.getState().isVisible({ q: 1, r: 0 })).toBe(true)
  expect(store.getState().isVisible(FAR)).toBe(false)
})

test('partial は霧セルのみ視界外で非表示にする', () => {
  const store = create('partial')

  expect(store.getState().isVisible(FAR)).toBe(false)
  expect(store.getState().isVisible({ q: 4, r: 4 })).toBe(true)
})

test('到達済み表示 ON なら隣接後に離れても表示し続ける', () => {
  const store = create('all-hidden')

  store.getState().markVisited(NEAR_FAR)
  expect(store.getState().isVisible(FAR)).toBe(true)

  store.getState().markVisited(START)
  expect(store.getState().isVisible(FAR)).toBe(true)
})

test('到達済み表示 OFF なら隣接後に離れると再度非表示にする', () => {
  const store = create('partial')

  store.getState().setShowVisited(false)
  store.getState().markVisited(NEAR_FAR)
  expect(store.getState().isVisible(FAR)).toBe(true)

  store.getState().markVisited(START)
  expect(store.getState().isVisible(FAR)).toBe(false)
})

test('setMode で霧を解除・再適用できる', () => {
  const store = create('all-hidden')

  store.getState().setMode('all-visible')
  expect(store.getState().isVisible(FAR)).toBe(true)

  store.getState().setMode('all-hidden')
  expect(store.getState().isVisible(FAR)).toBe(false)
})
