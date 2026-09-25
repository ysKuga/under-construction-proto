import { useMemo } from 'react'

import { useEventDispatcher } from '@/hooks/event'

import { useOptionalStage07EventTarget } from '../_contexts/event-context'
import { Stage07EventMap } from '../index.types'

/**
 * イベント名ごとに dispatch 関数を持つオブジェクト
 *
 * - `Stage07EventMap` のキーに付与した JSDoc を、`dispatcher['Stage07-xxx']()` の\
 *   呼出箇所でホバー表示できるようにする狙いでオブジェクト形式にしている
 */
type Stage07EventDispatcher = {
  [K in keyof Stage07EventMap]: (detail: Stage07EventMap[K]) => Promise<boolean>
}

/** Provider 外で発行する先（購読者がいないため何も起きない） */
const DETACHED_EVENT_TARGET = new EventTarget()

/**
 * stage-07 専用 EventTarget へイベントを発行する dispatcher を返す
 *
 * - `Stage07EventProvider` の外では、どこにも届かない EventTarget へ発行する\
 *   （`useEventDispatcher` の既定の window へは流さない）
 */
export const useStage07EventDispatcher = () => {
  const eventTarget = useOptionalStage07EventTarget()
  const dispatch = useEventDispatcher(eventTarget ?? DETACHED_EVENT_TARGET)

  return useMemo<Stage07EventDispatcher>(
    () =>
      new Proxy({} as Stage07EventDispatcher, {
        get: (_target, type: string) => (detail: unknown) =>
          dispatch(new CustomEvent(type, { detail })),
      }),
    [dispatch],
  )
}
