'use client'

import { PropsWithChildren, RefObject, useRef } from 'react'

import { createRequiredContext } from '@/utils/create-required-context'

import { Stage07Handle } from '../..'

const { RequiredContext, useRequiredContext } = createRequiredContext<
  RefObject<null | Stage07Handle>
>('useStage07HandleRef は Stage07HandleProvider の内側で使用してください')

/**
 * `Stage07` の imperative API（`Stage07Handle`）の ref を生成し配布する
 *
 * - `Stage07` を描画する側が `ref` へ渡し、外側の要素（`MoveOnAdjacentCellClick`、
 *   find-path proto-03 の「実行」等）が `moveTo`/`followPath` を命令する。
 *   複数の消費者から参照するため Context で配布する（r3f-state ルールの複数消費者と同じ方式）
 */
export const Stage07HandleProvider = (props: PropsWithChildren) => {
  const { children } = props

  const stage07HandleRef = useRef<Stage07Handle>(null)

  return (
    <RequiredContext.Provider value={stage07HandleRef}>
      {children}
    </RequiredContext.Provider>
  )
}

/** `Stage07Handle` の ref を返す */
export const useStage07HandleRef = (): RefObject<null | Stage07Handle> =>
  useRequiredContext()
