'use client'

import { PropsWithChildren, useState } from 'react'

import { FindPathEventContext } from './_contexts/event-context'
import { FindPathEventListeners } from './_event-listeners'

export { useFindPathEventTarget } from './_contexts/event-context'

/**
 * find-path（proto-03）専用の EventTarget を配布する
 *
 * - box-bot 側の `actorEventTarget`（action dispatch 用）とは分離する。\
 *   UI が担当範囲の情報（経路の提示・実行等）を発行し、EN 等のゲーム要素は\
 *   listener 側で組み合わせる（docs/concept/implementation/ui-jurisdiction）
 * - listener（`FindPathEventListeners`）を内側にまとめて配線する。EN 判定の\
 *   listener が energy store を参照するため、`EnergyStoreProvider` の内側に置く
 */
export const FindPathEventProvider = (props: PropsWithChildren) => {
  const { children } = props

  const [eventTarget] = useState(() => new EventTarget())

  return (
    <FindPathEventContext.Provider value={eventTarget}>
      <FindPathEventListeners />
      {children}
    </FindPathEventContext.Provider>
  )
}
