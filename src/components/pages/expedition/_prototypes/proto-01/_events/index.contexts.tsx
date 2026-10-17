'use client'

import { PropsWithChildren, useState } from 'react'

import { FindPathEventContext } from './_contexts/event-context'

export { useFindPathEventTarget } from './_contexts/event-context'

/**
 * find-path 専用の EventTarget を配布する
 *
 * - box-bot 側の `actorEventTarget`（action dispatch 用）とは分離する。\
 *   find-path 固有のドメインイベント（携行アイテム使用等、issue #181）専用
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
