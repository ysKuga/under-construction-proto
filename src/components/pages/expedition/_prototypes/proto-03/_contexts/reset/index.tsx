'use client'

import { Fragment, PropsWithChildren, useCallback, useState } from 'react'

import { createRequiredContext } from '@/utils/create-required-context'

const { RequiredContext, useRequiredContext } = createRequiredContext<
  () => void
>('useReset は ResetProvider の内側で使用してください')

/**
 * 配下を丸ごと再マウントして初期状態へ戻す「リセット」を配布する
 *
 * - 配下へ `key`（`resetKey`）を付け、`reset` で値を更新して再マウントする
 *   （境界値テスト用、issue #181。proto-01 と同じ方式）
 * - 配下の Provider 群（store 等）も再生成されるため、全 store が初期状態へ戻る
 * - context 自体は `key` の外側で配るため、`reset` の参照は再マウントをまたいで変わらない
 */
export const ResetProvider = (props: PropsWithChildren) => {
  const { children } = props

  const [resetKey, setResetKey] = useState(0)
  const reset = useCallback(() => setResetKey((key) => key + 1), [])

  return (
    <RequiredContext.Provider value={reset}>
      <Fragment key={resetKey}>{children}</Fragment>
    </RequiredContext.Provider>
  )
}

/** 配下を初期状態へ戻す関数を返す */
export const useReset = (): (() => void) => useRequiredContext()
