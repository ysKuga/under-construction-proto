import { expect, test } from 'vitest'

import { createActorsStore } from './store'

test('初期配置した actor の位置を持つ', () => {
  const store = createActorsStore({ player: { q: 0, r: 0 } })

  expect(store.getState().actors).toEqual({ player: { q: 0, r: 0 } })
})

test('moveActor で既存 actor の位置が更新される', () => {
  const store = createActorsStore({ player: { q: 0, r: 0 } })

  store.getState().moveActor('player', { q: 1, r: 0 })

  expect(store.getState().actors.player).toEqual({ q: 1, r: 0 })
})

test('spawnActor で新規 actor が追加される', () => {
  const store = createActorsStore({ player: { q: 0, r: 0 } })

  store.getState().spawnActor('mob-1', { q: 2, r: 1 })

  expect(store.getState().actors).toEqual({
    'mob-1': { q: 2, r: 1 },
    player: { q: 0, r: 0 },
  })
})

test('despawnActor で actor が取り除かれる', () => {
  const store = createActorsStore({
    'mob-1': { q: 2, r: 1 },
    player: { q: 0, r: 0 },
  })

  store.getState().despawnActor('mob-1')

  expect(store.getState().actors).toEqual({ player: { q: 0, r: 0 } })
})

test('registerOverlayContainer で actorId ごとにコンテナ DOM を登録できる', () => {
  const store = createActorsStore({ player: { q: 0, r: 0 } })
  const el = document.createElement('div')

  store.getState().registerOverlayContainer('player', el)

  expect(store.getState().overlayContainers.player).toBe(el)
})

test('registerOverlayContainer に el=null を渡すと登録が解除される', () => {
  const store = createActorsStore({ player: { q: 0, r: 0 } })
  const el = document.createElement('div')

  store.getState().registerOverlayContainer('player', el)
  store.getState().registerOverlayContainer('player', null)

  expect(store.getState().overlayContainers).toEqual({})
})

test('registerOverlayAnchor で actorId ごとにアンカー DOM を登録・解除できる', () => {
  const store = createActorsStore({ player: { q: 0, r: 0 } })
  const el = document.createElement('div')

  store.getState().registerOverlayAnchor('player', el)

  expect(store.getState().overlayAnchors.player).toBe(el)

  store.getState().registerOverlayAnchor('player', null)

  expect(store.getState().overlayAnchors).toEqual({})
})
