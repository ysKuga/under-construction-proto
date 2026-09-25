'use client'

import { PropsWithChildren, RefObject, useRef } from 'react'

import { Stage07Handle } from '@/prototypes/stage/stage-07'
import { createRequiredContext } from '@/utils/create-required-context'

const { RequiredContext, useRequiredContext } = createRequiredContext<
  RefObject<null | Stage07Handle>
>('useStage07HandleRef は Stage07HandleProvider の内側で使用してください')

/**
 * `Stage07` の imperative API（`Stage07Handle`）の ref を生成し配布する
 *
 * - stage content が `Stage07` の `ref` へ渡し、bot-bubbles content の「実行」が
 *   `followPath` を命令する。複数 content から参照するため Context で配布する
 *   （r3f-state ルールの複数消費者と同じ方式）
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
