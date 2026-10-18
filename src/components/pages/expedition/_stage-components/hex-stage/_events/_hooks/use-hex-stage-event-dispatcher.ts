import { useMemo } from 'react'

import { useEventDispatcher } from '@/hooks/event'

import { useOptionalHexStageEventTarget } from '../_contexts/event-context'
import { HexStageEventMap } from '../index.types'

/**
 * イベント名ごとに dispatch 関数を持つオブジェクト
 *
 * - `HexStageEventMap` のキーに付与した JSDoc を、`dispatcher['HexStage-xxx']()` の\
 *   呼出箇所でホバー表示できるようにする狙いでオブジェクト形式にしている
 */
type HexStageEventDispatcher = {
  [K in keyof HexStageEventMap]: (
    detail: HexStageEventMap[K],
  ) => Promise<boolean>
}

/** Provider 外で発行する先（購読者がいないため何も起きない） */
const DETACHED_EVENT_TARGET = new EventTarget()

/**
 * hex-stage 専用 EventTarget へイベントを発行する dispatcher を返す
 *
 * - `HexStageEventProvider` の外では、どこにも届かない EventTarget へ発行する\
 *   （`useEventDispatcher` の既定の window へは流さない）
 */
export const useHexStageEventDispatcher = () => {
  const eventTarget = useOptionalHexStageEventTarget()
  const dispatch = useEventDispatcher(eventTarget ?? DETACHED_EVENT_TARGET)

  return useMemo<HexStageEventDispatcher>(
    () =>
      new Proxy({} as HexStageEventDispatcher, {
        get: (_target, type: string) => (detail: unknown) =>
          dispatch(new CustomEvent(type, { detail })),
      }),
    [dispatch],
  )
}
