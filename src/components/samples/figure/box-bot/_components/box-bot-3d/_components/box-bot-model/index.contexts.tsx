'use client'

import * as React from 'react'
import type { PropsWithChildren } from 'react'

import { createRequiredContext } from '@/utils/create-required-context'

const { RequiredContext, useRequiredContext } = createRequiredContext<
  React.RefObject<EventTarget>
>('useBoxBotEventTarget should be used within <BoxBotEventProvider>')

/** box-bot-model の action イベント用 EventTarget を配布する Context */
export const BoxBotEventContext = RequiredContext

/** box-bot-model の action イベント発行/購読に使う EventTarget の ref を取得する */
export const useBoxBotEventTarget = (): React.RefObject<EventTarget> =>
  useRequiredContext()

type BoxBotEventProviderProps = PropsWithChildren<{
  /** 外部から共有する EventTarget。省略時は instance 固有のものを内部生成 */
  eventTarget?: EventTarget
}>

/**
 * instance 固有(または外部共有)の EventTarget を ref として配布する
 *
 * - ref に格納することで、レンダリングに関与しない値として扱う(useState は使わない)
 */
export const BoxBotEventProvider = ({
  children,
  eventTarget: eventTargetProp,
}: BoxBotEventProviderProps) => {
  const eventTargetRef = React.useRef<EventTarget | null>(null)
  if (eventTargetRef.current === null) {
    eventTargetRef.current = eventTargetProp ?? new EventTarget()
  }

  return (
    <BoxBotEventContext.Provider
      value={eventTargetRef as React.RefObject<EventTarget>}
    >
      {children}
    </BoxBotEventContext.Provider>
  )
}
