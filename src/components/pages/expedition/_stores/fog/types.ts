import { StoreApi } from 'zustand/vanilla'

import { HexCell } from '@/prototypes/stage/stage-07/_lib/hex'

/**
 * 霧（マスの非表示）の適用範囲
 *
 * - `all-visible`: 霧なし（全マス常時表示）
 * - `all-hidden`: 全マスが霧
 * - `partial`: 指定したマスのみ霧、それ以外は常時表示
 */
export type FogMode = 'all-hidden' | 'all-visible' | 'partial'

/**
 * 霧の状態・可視判定を保持する store
 *
 * - 霧セルは「視界（現在地自身と6近傍）」または「到達済み表示ONかつ到達済み」の
 *   場合のみ表示、霧セル以外は常時表示
 */
export type FogState = {
  /** 現在地（視界の中心） */
  currentCell: HexCell
  /** cell が表示可能か */
  isVisible: (cell: HexCell) => boolean
  /** 現在地を cell へ更新し、視界（cell 自身と6近傍）を到達済みとして記録する */
  markVisited: (cell: HexCell) => void
  /** 霧の適用範囲 */
  mode: FogMode
  /** 霧の適用範囲を切り替える */
  setMode: (mode: FogMode) => void
  /** 到達済み表示の有無を切り替える */
  setShowVisited: (show: boolean) => void
  /**
   * 到達済みの霧セルを視界外でも表示するか
   *
   * - true: 隣接後は表示し続ける
   * - false: 隣接後に離れると再度非表示
   */
  showVisited: boolean
  /** 到達済みセルのキー（"q,r"）一覧 */
  visitedKeys: ReadonlySet<string>
}

export type FogStore = StoreApi<FogState>

/** fog store の生成オプション */
export type FogStoreOptions = {
  /** 初期の適用範囲 */
  initialMode: FogMode
  /** `partial` で霧とするセル一覧 */
  partialFogCells: readonly HexCell[]
  /** bot の初期セル（初期の視界の中心） */
  startCell: HexCell
}
