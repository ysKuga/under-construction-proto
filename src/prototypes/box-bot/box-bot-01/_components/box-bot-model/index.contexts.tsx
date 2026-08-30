'use client'

import * as React from 'react'
import type { PropsWithChildren } from 'react'
import type { Group } from 'three'

import { createRequiredContext } from '@/utils/create-required-context'

import type { AnyBoxBotAction } from '../../_actions/types'

import type { BoxBotRefs, ClickBindings } from './index.types'

const { RequiredContext, useRequiredContext } =
  createRequiredContext<EventTarget>(
    'useBoxBotEventTarget should be used within <BoxBotEventProvider>',
  )

/** box-bot-model の action イベント用 EventTarget を配布する Context */
export const BoxBotEventContext = RequiredContext

/** box-bot-model の action イベント発行/購読に使う EventTarget を取得する */
export const useBoxBotEventTarget = (): EventTarget => useRequiredContext()

const {
  RequiredContext: RequiredRefsContext,
  useRequiredContext: useRequiredRefsContext,
} = createRequiredContext<BoxBotRefs>(
  'useBoxBotRefs should be used within <BoxBotRefsProvider>',
)

/** bot 本体で共有する ref 群を配布する Context */
export const BoxBotRefsContext = RequiredRefsContext

/** bot 本体で共有する ref 群を取得する */
export const useBoxBotRefs = (): BoxBotRefs => useRequiredRefsContext()

/** `BoxBot3D` から注入されるアクション設定 */
export type BoxBotActions = {
  /** このモデルが実行するアクション一覧 */
  actions: readonly AnyBoxBotAction[]
  /** 解決済みの要素クリック → action イベント名 対応表 */
  clickBindings: ClickBindings
}

const {
  RequiredContext: RequiredActionsContext,
  useRequiredContext: useRequiredActionsContext,
} = createRequiredContext<BoxBotActions>(
  'useBoxBotActions should be used within <BoxBotActionsProvider>',
)

/** `BoxBot3D` から注入されるアクション設定を配布する Context */
export const BoxBotActionsContext = RequiredActionsContext

/** `BoxBot3D` から注入されたアクション一覧・クリック対応表を取得する */
export const useBoxBotActions = (): BoxBotActions => useRequiredActionsContext()

/**
 * `BoxBot3D` が props で受け取り解決した `actions` / `clickBindings` を配布する
 *
 * - Context は r3f Canvas 境界を越えないため、`BoxBot3D` から `BoxBotModel` へは props、\
 *   その内側でこの Provider が Context 化する
 */
export const BoxBotActionsProvider = ({
  actions,
  children,
  clickBindings,
}: PropsWithChildren<BoxBotActions>) => {
  const value = React.useMemo<BoxBotActions>(
    () => ({ actions, clickBindings }),
    [actions, clickBindings],
  )

  return (
    <BoxBotActionsContext.Provider value={value}>
      {children}
    </BoxBotActionsContext.Provider>
  )
}

/**
 * bot 本体で共有する ref 群を生成し配布する
 *
 * - `rootRef`(jump の squash 対象)/ `yawRef`(y 軸回転の累積)/ `fallPivotRef`(fall の前傾)/\
 *   `leftArmRef` `rightArmRef`(fall の腕引き寄せ)。いずれも JSX の `<group ref>` にバインドされ、\
 *   adapter 経由でアクションへ操作面を渡す
 * - 単発の進行度など アクション固有の ref は各アクション(`_actions/<name>/`)が自前で `useRef` する
 * - JSX と adapter の双方から参照される bot 構造の ref を Context で配布する(r3f-state ルール)
 */
export const BoxBotRefsProvider = ({ children }: PropsWithChildren) => {
  const rootRef = React.useRef<Group>(null)
  const yawRef = React.useRef<Group>(null)
  const fallPivotRef = React.useRef<Group>(null)
  const leftArmRef = React.useRef<Group>(null)
  const rightArmRef = React.useRef<Group>(null)

  const refs = React.useMemo<BoxBotRefs>(
    () => ({ fallPivotRef, leftArmRef, rightArmRef, rootRef, yawRef }),
    [fallPivotRef, leftArmRef, rightArmRef, rootRef, yawRef],
  )

  return (
    <BoxBotRefsContext.Provider value={refs}>
      {children}
    </BoxBotRefsContext.Provider>
  )
}

type BoxBotEventProviderProps = PropsWithChildren<{
  /** 外部から共有する EventTarget。省略時は instance 固有のものを内部生成 */
  eventTarget?: EventTarget
}>

/**
 * instance 固有(または外部共有)の EventTarget を配布する
 *
 * - lazy initializer で 1 度だけ生成する。ref の `.current` をレンダー中に読んで\
 *   Context 値へ渡す形は React Compiler の `react-hooks/refs` ルールに抵触するため、\
 *   `useState` の setter を使わない形(実質 const)で代替する
 */
export const BoxBotEventProvider = ({
  children,
  eventTarget: eventTargetProp,
}: BoxBotEventProviderProps) => {
  const [eventTarget] = React.useState<EventTarget>(
    () => eventTargetProp ?? new EventTarget(),
  )

  return (
    <BoxBotEventContext.Provider value={eventTarget}>
      {children}
    </BoxBotEventContext.Provider>
  )
}
