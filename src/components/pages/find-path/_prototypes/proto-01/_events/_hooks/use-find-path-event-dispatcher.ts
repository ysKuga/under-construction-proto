import { useMemo } from 'react'

import { useEventDispatcher } from '@/hooks/event'

import { useFindPathEventTarget } from '../_contexts/event-context'
import { FindPathEventMap } from '../index.types'

/**
 * イベント名ごとに dispatch 関数を持つオブジェクト
 *
 * - `FindPathEventMap` のキーに付与した JSDoc を、`dispatcher['FindPath-xxx']()` の\
 *   呼出箇所でホバー表示できるようにする狙いでオブジェクト形式にしている
 */
type FindPathEventDispatcher = {
  [K in keyof FindPathEventMap]: (detail?: FindPathEventMap[K]) => Promise<void>
}

/**
 * find-path 専用 EventTarget へイベントを発行する dispatcher を返す
 */
export const useFindPathEventDispatcher = () => {
  const eventTarget = useFindPathEventTarget()
  const dispatch = useEventDispatcher(eventTarget)

  return useMemo<FindPathEventDispatcher>(
    () =>
      new Proxy({} as FindPathEventDispatcher, {
        get: (_target, type: string) => (detail?: unknown) =>
          dispatch(new CustomEvent(type, { detail })),
      }),
    [dispatch],
  )
}
