import { useMemo } from 'react'

import { useEventDispatcher } from '@/hooks/event'

import { useEnergyEventTarget } from '../_contexts/event-context'
import { EnergyEventMap } from '../index.types'

/**
 * イベント名ごとに dispatch 関数を持つオブジェクト
 *
 * - `EnergyEventMap` のキーに付与した JSDoc を、`dispatcher['Energy-consume']()` の\
 *   呼出箇所でホバー表示できるようにする狙いでオブジェクト形式にしている
 */
type EnergyEventDispatcher = {
  [K in keyof EnergyEventMap]: (detail?: EnergyEventMap[K]) => Promise<void>
}

/**
 * energy 専用 EventTarget へイベントを発行する dispatcher を返す
 */
export const useEnergyEventDispatcher = () => {
  const eventTarget = useEnergyEventTarget()
  const dispatch = useEventDispatcher(eventTarget)

  return useMemo<EnergyEventDispatcher>(
    () =>
      new Proxy({} as EnergyEventDispatcher, {
        get: (_target, type: string) => (detail?: unknown) =>
          dispatch(new CustomEvent(type, { detail })),
      }),
    [dispatch],
  )
}
