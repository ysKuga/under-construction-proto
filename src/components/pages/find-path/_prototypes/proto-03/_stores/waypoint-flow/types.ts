import { StoreApi } from 'zustand/vanilla'

import { HexCell } from '@/prototypes/stage/stage-07/_lib/hex'

/**
 * 中継点フローの状態（issue #137 backlog「中継点の設定」）
 *
 * - `idle`: 通常状態。セルクリックは `useHexMove` 経由の隣接移動/非隣接経路探索
 * - `proposing`: 非隣接クリックで経路が求まった直後。bot 頭上に `WaypointBubble`
 *   （思考吹き出し）を表示する
 * - `selecting`: `WaypointBubble` クリックで移行。`Stage07` を非対話化し
 *   `WaypointSelectLayer` がセルクリックを拾って中継点を設置/除去する。
 *   再度 `WaypointBubble` をクリックすると `proposing` へ戻る
 */
export type WaypointFlowState = 'idle' | 'proposing' | 'selecting'

export type WaypointFlowStore = StoreApi<WaypointFlowStoreState>

/**
 * 経路の提示（目標・中継点）と中継点フローの状態を保持する store
 *
 * - 経路の到達可否の検証は呼び出し側で行う。ここでは state 更新のみ行う
 */
export type WaypointFlowStoreState = {
  /** 目標・中継点を消し、通常状態へ戻す */
  clear: () => void
  /** 中継点フローの状態 */
  flowState: WaypointFlowState
  /** 非隣接クリックで選んだ経路の目標セル（経路提示中のみ） */
  objectiveCell?: HexCell
  /** cell を目標として経路提示中(`proposing`)へ移行する */
  propose: (cell: HexCell) => void
  /** 中継点フローの状態を切り替える */
  setFlowState: (flowState: WaypointFlowState) => void
  /** 中継点を置き換える */
  setWaypoints: (waypoints: HexCell[]) => void
  /** 目標を消し、通常状態へ戻す（中継点は残す） */
  unpropose: () => void
  /** 設置済みの中継点（経由順は最近傍順で別途決める） */
  waypoints: HexCell[]
}
