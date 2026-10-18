'use client'

import { PropsWithChildren, RefObject, useRef } from 'react'

import { createRequiredContext } from '@/utils/create-required-context'

import { HexStageHandle } from '../..'

const { RequiredContext, useRequiredContext } = createRequiredContext<
  RefObject<null | HexStageHandle>
>('useHexStageHandleRef は HexStageHandleProvider の内側で使用してください')

/**
 * `HexStage` の imperative API（`HexStageHandle`）の ref を生成し配布する
 *
 * - `HexStage` を描画する側が `ref` へ渡し、外側の要素（`MoveOnAdjacentCellClick`、
 *   find-path proto-03 の「実行」等）が `moveTo`/`followPath` を命令する。
 *   複数の消費者から参照するため Context で配布する（r3f-state ルールの複数消費者と同じ方式）
 */
export const HexStageHandleProvider = (props: PropsWithChildren) => {
  const { children } = props

  const hexStageHandleRef = useRef<HexStageHandle>(null)

  return (
    <RequiredContext.Provider value={hexStageHandleRef}>
      {children}
    </RequiredContext.Provider>
  )
}

/** `HexStageHandle` の ref を返す */
export const useHexStageHandleRef = (): RefObject<null | HexStageHandle> =>
  useRequiredContext()
