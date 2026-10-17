'use client'

import { PropsWithChildren, useMemo, useState } from 'react'

import { createRequiredContext } from '@/utils/create-required-context'

import { generateStage } from '../../_lib/generate-stage'
import { StageLayoutProvider } from '../stage-layout'
import { DEFAULT_STAGE_LAYOUT } from '../stage-layout/constants'

import { GENERATE_STAGE_PARAMS } from './constants'

/** 盤面生成の seed とその更新 */
export type StageSeed = {
  /** 盤面生成の seed（未指定なら既定の固定配置） */
  seed: number | undefined
  /** seed を変更し、盤面を生成し直す */
  setSeed: (seed: number) => void
}

const { RequiredContext, useRequiredContext } =
  createRequiredContext<StageSeed>(
    'useStageSeed は StageSeedProvider の内側で使用してください',
  )

type StageSeedProviderProps = PropsWithChildren<{
  /** 盤面生成の seed の初期値（未指定なら既定の固定配置） */
  initialSeed?: number
}>

/**
 * seed から盤面配置を生成し、`StageLayoutProvider` で配布する（issue #315）
 *
 * - seed 未指定・生成失敗時は `DEFAULT_STAGE_LAYOUT` を配る
 * - seed 変更時は `key` で配下を丸ごと再マウントし、全 store を新しい盤面の初期状態にする
 * - seed は再マウントの外側で保持するため、配下のリセットでは同じ盤面へ戻る
 */
export const StageSeedProvider = (props: StageSeedProviderProps) => {
  const { children, initialSeed } = props

  const [seed, setSeed] = useState(initialSeed)
  /** seed から生成した盤面配置 */
  const stageLayout = useMemo(
    () =>
      (seed === undefined
        ? undefined
        : generateStage(seed, GENERATE_STAGE_PARAMS)) ?? DEFAULT_STAGE_LAYOUT,
    [seed],
  )
  const stageSeed = useMemo(() => ({ seed, setSeed }), [seed])

  return (
    <RequiredContext.Provider value={stageSeed}>
      <StageLayoutProvider key={seed ?? 'default'} stageLayout={stageLayout}>
        {children}
      </StageLayoutProvider>
    </RequiredContext.Provider>
  )
}

/** 盤面生成の seed とその更新を返す */
export const useStageSeed = (): StageSeed => useRequiredContext()
