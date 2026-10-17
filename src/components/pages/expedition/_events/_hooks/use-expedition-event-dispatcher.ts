import { useMemo } from 'react'

import { useEventDispatcher } from '@/hooks/event'

import { useExpeditionEventTarget } from '../_contexts/event-context'
import { ExpeditionEventMap } from '../index.types'

/**
 * イベント名ごとに dispatch 関数を持つオブジェクト
 *
 * - `ExpeditionEventMap` のキーに付与した JSDoc を、`dispatcher['Expedition-xxx']()` の\
 *   呼出箇所でホバー表示できるようにする狙いでオブジェクト形式にしている
 * - 戻り値は listener に拒否（`preventDefault()`）されなければ `true`
 */
type ExpeditionEventDispatcher = {
  [K in keyof ExpeditionEventMap]: (
    detail: ExpeditionEventMap[K],
  ) => Promise<boolean>
}

/**
 * expedition 専用 EventTarget へイベントを発行する dispatcher を返す
 *
 * - 全イベントを cancelable で発行し、listener 側で実行を拒否できるようにする
 */
export const useExpeditionEventDispatcher = () => {
  const eventTarget = useExpeditionEventTarget()
  const dispatch = useEventDispatcher(eventTarget)

  return useMemo<ExpeditionEventDispatcher>(
    () =>
      new Proxy({} as ExpeditionEventDispatcher, {
        get: (_target, type: string) => (detail: unknown) =>
          dispatch(new CustomEvent(type, { cancelable: true, detail })),
      }),
    [dispatch],
  )
}
