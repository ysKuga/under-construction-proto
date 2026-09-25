import { StoreApi } from 'zustand/vanilla'

/**
 * 表示・演出の切替設定を保持する store
 *
 * - 操作パネルで切り替え、ステージ側が購読する
 */
export type DisplaySettingsState = {
  /** 移動可能マスの表示演出 */
  displayMode: MoveTargetDisplayMode
  /** 歩行モーション（`Stage07` の `enableWalking`）を有効にするか */
  enableWalking: boolean
  /** 移動可能マスの表示演出を切り替える */
  setDisplayMode: (displayMode: MoveTargetDisplayMode) => void
  /** 歩行モーションの有無を切り替える */
  setEnableWalking: (enableWalking: boolean) => void
}

export type DisplaySettingsStore = StoreApi<DisplaySettingsState>

/** 移動可能マス（`MoveTargetLayer`）の表示演出の種類 */
export type MoveTargetDisplayMode =
  /** 対象セルの位置で opacity 0→1 のみ（位置移動なし） */
  | 'fade'
  /** transition なしで対象セルへ即座に出現 */
  | 'instant'
  /** bot マスへ集合表示 → 対象セルへ散開（既定） */
  | 'scatter'
