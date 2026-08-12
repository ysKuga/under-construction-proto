import { StoreApi } from 'zustand/vanilla'

import { MoveIntent } from '../../types'

/** 状態を持たない操作専用 store。移動企図 (経路生成 → path-store への書き込み) のみを行う */
export type IntentState = {
  /** 移動企図。経路を生成するのみで position は更新しない */
  dispatchMoveIntent: (intent: MoveIntent) => void
}

export type IntentStore = StoreApi<IntentState>
