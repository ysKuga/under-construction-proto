'use client'

import { PropsWithChildren, useState } from 'react'

import { FindPathEventContext } from './_contexts/event-context'

export { useFindPathEventTarget } from './_contexts/event-context'

/**
 * find-path（proto-03）専用の EventTarget を配布する
 *
 * - box-bot 側の `actorEventTarget`（action dispatch 用）とは分離する。\
 *   UI が担当範囲の情報（経路の提示・実行等）を発行し、EN 等のゲーム要素は\
 *   listener 側で組み合わせる（docs/concept/implementation/ui-jurisdiction）
 */
export const FindPathEventProvider = (props: PropsWithChildren) => {
  const { children } = props

  const [eventTarget] = useState(() => new EventTarget())

  return (
    <FindPathEventContext.Provider value={eventTarget}>
      {children}
    </FindPathEventContext.Provider>
  )
}
