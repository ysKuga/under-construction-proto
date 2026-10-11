'use client'

import { PropsWithChildren } from 'react'

import { createRequiredContext } from '@/utils/create-required-context'

import { StageLayout } from './types'

const { RequiredContext, useRequiredContext } =
  createRequiredContext<StageLayout>(
    'useStageLayout は StageLayoutProvider の内側で使用してください',
  )

type StageLayoutProviderProps = PropsWithChildren<{
  /** 配布する盤面配置 */
  stageLayout: StageLayout
}>

/**
 * 盤面配置（`StageLayout`）を配布する
 *
 * - 配置はマウント中不変のため store でなく Context の値で配る
 * - 差し替え（ランダム生成等、issue #315）は Provider の `key` 変更で再マウントする
 */
export const StageLayoutProvider = (props: StageLayoutProviderProps) => {
  const { children, stageLayout } = props

  return (
    <RequiredContext.Provider value={stageLayout}>
      {children}
    </RequiredContext.Provider>
  )
}

/** 盤面配置を返す */
export const useStageLayout = (): StageLayout => useRequiredContext()
