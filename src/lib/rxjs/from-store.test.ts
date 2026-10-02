import { createStore } from 'zustand/vanilla'

import { fromStore } from './from-store'

/** テスト用の store を生成する */
const createCounterStore = () => createStore(() => ({ count: 0 }))

test('購読直後に現在の state を流す', () => {
  const store = createCounterStore()
  const values: number[] = []

  const subscription = fromStore(store).subscribe((state) =>
    values.push(state.count),
  )

  expect(values).toEqual([0])
  subscription.unsubscribe()
})

test('state の変化を流す', () => {
  const store = createCounterStore()
  const values: number[] = []

  const subscription = fromStore(store).subscribe((state) =>
    values.push(state.count),
  )

  store.setState({ count: 1 })
  store.setState({ count: 2 })

  expect(values).toEqual([0, 1, 2])
  subscription.unsubscribe()
})

test('購読解除後は流さない', () => {
  const store = createCounterStore()
  const values: number[] = []

  const subscription = fromStore(store).subscribe((state) =>
    values.push(state.count),
  )

  subscription.unsubscribe()
  store.setState({ count: 1 })

  expect(values).toEqual([0])
})
