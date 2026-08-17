import { StoreApi } from 'zustand/vanilla'

import { StageTransform } from '../_lib/stage-coords'
import { ProgressMode } from '../types'

/**
 * props・store から算出する派生値のみを保持する store
 *
 * - `./store.ts` にて実装
 */
export type ComputedState = {
  /** 行動進行モード (全 actor 代表 (先頭) の値) */
  progressMode: ProgressMode
  /** stage 表示用の変換パラメータ (全 actor の目標地点から算出した bounding box fit) */
  stageTransform: StageTransform
}

export type ComputedStore = StoreApi<ComputedState>
