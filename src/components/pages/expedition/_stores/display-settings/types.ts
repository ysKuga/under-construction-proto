import { StoreApi } from 'zustand/vanilla'

/**
 * 表示・演出の切替設定を保持する store
 *
 * - デバッグ要素（`_contents/debug-panel`）・調整スライダー（`stage-area/_contents/stage-sliders`）で切り替え、ステージ側が購読する
 */
export type DisplaySettingsState = {
  /** 歩行中の体の上下の最大持ち上げ量(world) */
  bodyBobHeight: number
  /** 移動可能マスの表示演出 */
  displayMode: MoveTargetDisplayMode
  /** 歩行モーション（`Stage07` の `enableWalking`）を有効にするか */
  enableWalking: boolean
  /** walking の脚振り角の振幅(rad) */
  legSwingAngle: number
  /** walking の脚振り周期の上限(秒) */
  maxWalkCycleSec: number
  /** セル間移動アニメーションの所要時間(ms) */
  moveDurationMs: number
  /** 体の上下量を切り替える */
  setBodyBobHeight: (bodyBobHeight: number) => void
  /** 移動可能マスの表示演出を切り替える */
  setDisplayMode: (displayMode: MoveTargetDisplayMode) => void
  /** 歩行モーションの有無を切り替える */
  setEnableWalking: (enableWalking: boolean) => void
  /** 脚振り角を切り替える */
  setLegSwingAngle: (legSwingAngle: number) => void
  /** 歩行周期の上限を切り替える */
  setMaxWalkCycleSec: (maxWalkCycleSec: number) => void
  /** 移動時間を切り替える */
  setMoveDurationMs: (moveDurationMs: number) => void
  /** 独立 bot の向き同期の有無を切り替える */
  setSyncStandaloneBotFacing: (syncStandaloneBotFacing: boolean) => void
  /** 独立 bot（状態表示）の向きをステージ上の bot と同期するか */
  syncStandaloneBotFacing: boolean
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
