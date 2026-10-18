'use client'

import { PropsWithChildren, useState } from 'react'

import { HexStageEventContext } from './_contexts/event-context'

export { useHexStageEventTarget } from './_contexts/event-context'

/**
 * hex-stage 専用の EventTarget を配布する
 *
 * - `HexStage` の外側に置く（`ActorsStoreProvider` と同じく、`HexStage` の外から\
 *   actor の状態変化を購読できるようにするため）
 * - 省略可。Provider がなければ `HexStage` は発行しても何も起きない
 * - box-bot 側の `actorEventTarget`（action dispatch 用）とは分離する
 */
export const HexStageEventProvider = (props: PropsWithChildren) => {
  const { children } = props

  const [eventTarget] = useState(() => new EventTarget())

  return (
    <HexStageEventContext.Provider value={eventTarget}>
      {children}
    </HexStageEventContext.Provider>
  )
}
