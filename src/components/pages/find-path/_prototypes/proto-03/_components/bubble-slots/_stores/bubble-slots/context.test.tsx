import { act, renderHook } from '@testing-library/react'
import { PropsWithChildren } from 'react'
import { BehaviorSubject, Subject } from 'rxjs'

import { BubbleSlotsStoreProvider, useBubbleSlotsStore } from './context'
import { BubbleSlotEntry } from './types'

vi.unmock('zustand')

/** テスト用の吹き出し（描画はしない） */
const Bubble = () => null

/**
 * 吹き出しの表示状態を購読する hook を Provider 配下で描画する
 *
 * @param initialBubbles 格納する吹き出し
 */
const renderVisibility = (initialBubbles: BubbleSlotEntry[]) =>
  renderHook(() => useBubbleSlotsStore((state) => state.visibility), {
    wrapper: (props: PropsWithChildren) => (
      <BubbleSlotsStoreProvider initialBubbles={initialBubbles}>
        {props.children}
      </BubbleSlotsStoreProvider>
    ),
  })

test('表示条件の流れを表示状態へ反映する', () => {
  const visible$ = new BehaviorSubject(true)
  const { result } = renderVisibility([{ Bubble, id: 'a', visible$ }])

  expect(result.current).toEqual({ a: true })

  act(() => visible$.next(false))

  expect(result.current).toEqual({ a: false })
})

test('最初の値が流れるまでは表示状態に含まれない（非表示扱い）', () => {
  const visible$ = new Subject<boolean>()
  const { result } = renderVisibility([{ Bubble, id: 'a', visible$ }])

  expect(result.current).toEqual({})

  act(() => visible$.next(true))

  expect(result.current).toEqual({ a: true })
})

test('アンマウントで表示条件の購読を解除する', () => {
  const visible$ = new BehaviorSubject(true)
  const { unmount } = renderVisibility([{ Bubble, id: 'a', visible$ }])

  unmount()

  expect(visible$.observed).toBe(false)
})
