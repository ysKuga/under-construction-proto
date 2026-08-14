import { useMemo } from 'react'

import { useEventDispatcher } from '@/hooks/event'

import { useScopeEventTarget } from '../_contexts/scope-event-context'
import { TimeControl03EventMap } from '../index.types'

/**
 * イベント名ごとに dispatch 関数を持つオブジェクト
 *
 * - `TimeControl03EventMap` のキーに付与した JSDoc を、`dispatcher['reset-all']()` の\
 *   呼出箇所でホバー表示できるようにする狙いでオブジェクト形式にしている
 */
type TimeControl03EventDispatcher = {
  [K in keyof TimeControl03EventMap]: (
    detail?: TimeControl03EventMap[K],
  ) => Promise<void>
}

/**
 * scope (この time-control-03 instance) 専用 EventTarget へイベントを発行する dispatcher を返す
 */
export const useTimeControl03EventDispatcher = () => {
  const eventTarget = useScopeEventTarget()
  const dispatch = useEventDispatcher(eventTarget)

  return useMemo<TimeControl03EventDispatcher>(
    () =>
      new Proxy({} as TimeControl03EventDispatcher, {
        get: (_target, type: string) => (detail?: unknown) =>
          dispatch(new CustomEvent(type, { detail })),
      }),
    [dispatch],
  )
}
