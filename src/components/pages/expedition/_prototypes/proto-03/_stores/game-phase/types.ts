import { StoreApi } from 'zustand/vanilla'

/**
 * ゲームのフェーズ
 *
 * - `playing`: 通常
 * - `clearing`: ゴール判定済み（セル進入時）。bot がゴールセルの中心へ移動中
 * - `cleared`: bot がゴールセルの中心へ到着した。リセットまで続く
 */
export type GamePhase = 'playing' | 'clearing' | 'cleared'

/**
 * フェーズごとに許可する操作・演出
 *
 * - 各所はフェーズを直接見ず、ここの項目で可否を判定する
 */
export type PhasePermissions = {
  /** セルへの進入（進入ガード） */
  enterCell: boolean
  /** ステージの操作（`Stage07` の `interactive`） */
  operateStage: boolean
  /** EN 切れ演出（予防姿勢） */
  performEnergyOut: boolean
  /** bot 頭上・目標セル上の吹き出しの表示 */
  showBubbles: boolean
  /** 自動移動が EN 不足で止まった際の警告 */
  warnEnergyShortage: boolean
}

/** フェーズで可否を判定する操作・演出の名前 */
export type PhasePermission = keyof PhasePermissions

/**
 * ゲームのフェーズを保持する store
 *
 * - 遷移は `playing` → `clearing` → `cleared` の一方向。戻すときはリセット（store の作り直し）
 */
export type GamePhaseState = {
  /**
   * 現在のフェーズで許可されているか
   *
   * @param permission 判定する操作・演出
   */
  allows: (permission: PhasePermission) => boolean
  /** bot がゴールセルの中心へ着いた。`clearing` のときのみ `cleared` へ進める */
  arriveAtGoal: () => void
  /** 現在のフェーズ */
  phase: GamePhase
  /** ゴールへ進入した。`playing` のときのみ `clearing` へ進める */
  reachGoal: () => void
}

export type GamePhaseStore = StoreApi<GamePhaseState>
