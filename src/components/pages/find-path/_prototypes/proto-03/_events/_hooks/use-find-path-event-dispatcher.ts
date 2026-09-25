import { useMemo } from 'react'

import { useEventDispatcher } from '@/hooks/event'

import { useFindPathEventTarget } from '../_contexts/event-context'
import { FindPathEventMap } from '../index.types'

/**
 * イベント名ごとに dispatch 関数を持つオブジェクト
 *
 * - `FindPathEventMap` のキーに付与した JSDoc を、`dispatcher['FindPath-xxx']()` の\
 *   呼出箇所でホバー表示できるようにする狙いでオブジェクト形式にしている
 * - 戻り値は listener に拒否（`preventDefault()`）されなければ `true`
 */
type FindPathEventDispatcher = {
  [K in keyof FindPathEventMap]: (
    detail: FindPathEventMap[K],
  ) => Promise<boolean>
}

/**
 * find-path 専用 EventTarget へイベントを発行する dispatcher を返す
 *
 * - 全イベントを cancelable で発行し、listener 側で実行を拒否できるようにする
 */
export const useFindPathEventDispatcher = () => {
  const eventTarget = useFindPathEventTarget()
  const dispatch = useEventDispatcher(eventTarget)

  return useMemo<FindPathEventDispatcher>(
    () =>
      new Proxy({} as FindPathEventDispatcher, {
        get: (_target, type: string) => (detail: unknown) =>
          dispatch(new CustomEvent(type, { cancelable: true, detail })),
      }),
    [dispatch],
  )
}
