'use client'

import { PropsWithChildren, useState } from 'react'

import { EnergyEventContext } from './_contexts/event-context'

export { useEnergyEventTarget } from './_contexts/event-context'

/**
 * energy 専用の EventTarget を配布する
 *
 * - box-bot 側の `actorEventTarget`（action dispatch 用）とは分離する。\
 *   EN 消費・EN 切れ検知（issue #181）専用のドメインイベント用
 */
export const EnergyEventProvider = (props: PropsWithChildren) => {
  const { children } = props

  const [eventTarget] = useState(() => new EventTarget())

  return (
    <EnergyEventContext.Provider value={eventTarget}>
      {children}
    </EnergyEventContext.Provider>
  )
}
