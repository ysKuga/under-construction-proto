'use client'

import { PropsWithChildren, useState } from 'react'

import { createRequiredContext } from '@/utils/create-required-context'

const { RequiredContext, useRequiredContext } =
  createRequiredContext<EventTarget>(
    'usePlayerActorEventTarget は PlayerActorEventTargetProvider の内側で使用してください',
  )

/**
 * player bot（box-bot-01）と共有する EventTarget を生成し配布する
 *
 * - stage content が `Stage07` の `actorEventTarget` へ渡し、bot への action
 *   （walking・face・energyOut 等）の dispatch 先にする
 * - standalone-bot content が walking 等を購読し、独立 bot へ中継する（issue #248）。
 *   複数 content から参照するため Context で配布する
 */
export const PlayerActorEventTargetProvider = (props: PropsWithChildren) => {
  const { children } = props

  const [actorEventTarget] = useState<EventTarget>(() => new EventTarget())

  return (
    <RequiredContext.Provider value={actorEventTarget}>
      {children}
    </RequiredContext.Provider>
  )
}

/** player bot と共有する EventTarget を返す */
export const usePlayerActorEventTarget = (): EventTarget => useRequiredContext()
