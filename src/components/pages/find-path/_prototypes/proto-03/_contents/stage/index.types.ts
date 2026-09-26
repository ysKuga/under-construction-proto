import { RefObject } from 'react'

import { Stage07Handle } from '@/prototypes/stage/stage-07'
import { HexCell } from '@/prototypes/stage/stage-07/_lib/hex'

import { MoveTargetDisplayMode } from '../../_stores/display-settings/types'

/**
 * 進入拒否条件を1件表す
 *
 * - `perceived`: 認識として不可（未到達・EN 切れ等、事前に把握できるため
 *   移動可能マス表示等のガイドにも反映する）
 * - `resultOnly`: 結果として不可（認識外の障害物・他アクターとのコンフリクト等、
 *   実行してみないと分からない。現時点では実例なし）
 */
export type EnterGuard = {
  /** 対象セルへ進入可能か */
  check: (cell: HexCell) => boolean
  /** 判定の種類 */
  kind: 'perceived' | 'resultOnly'
}

export type UseStageReturn = {
  /** `Stage07` と bot で共有する EventTarget（EN 切れ演出の dispatch 先） */
  actorEventTarget: EventTarget
  /** `Stage07` へ渡す進入可否（実際の移動判定・選択可能表示用。EN 残量チェック込みの全ガード） */
  canEnterCell: (cell: HexCell) => boolean
  /**
   * `MoveTargetLayer` へ渡す進入可否（`perceived` ガードのみ、EN 残量チェックは除く）
   *
   * - EN 残量チェックを含めると EN 変化のたびこの関数が新しい参照になり、
   *   `MoveTargetLayer` の `React.memo` が効かなくなる
   */
  canEnterCellPerceived: (cell: HexCell) => boolean
  /** player の現在セル */
  currentCell: HexCell
  /** 移動可能マスの表示演出 */
  displayMode: MoveTargetDisplayMode
  /** 歩行モーションの有無 */
  enableWalking: boolean
  /** セル hover 時の説明（障害物・アイテム） */
  getCellTitle: (cell: HexCell) => string | undefined
  /** 現在地セル変更時（移動成立時） */
  handleCellChange: (cell: HexCell) => void
  /** 自動移動の終了時 */
  handleFollowPathEnd: (blockedCell?: HexCell) => void
  /** 非隣接セルクリック時 */
  handleNonAdjacentClick: (cell: HexCell) => Promise<void>
  /** 中継点選択モード中のセルクリック時 */
  handleWaypointCellClick: (cell: HexCell) => void
  /** `Stage07` を操作可能にするか（中継点選択中・自動移動中は不可） */
  interactive: boolean
  /** 目標マーカーを置くセル（自動移動中は固定した経路の終点） */
  objectiveMarkerCell?: HexCell
  /** 提示中の経路 */
  previewPath: HexCell[]
  /** `Stage07`（hex タイル）の DOM を visibility registry へ登録する（`kind: 'floor'` 固定） */
  registerFloorVisibilityNode: RegisterCellVisibilityNode
  /** `GoalMarkerLayer`/`ObstacleLayer`/`OneWayLayer`/`ItemLayer` の DOM を visibility registry へ登録する（`kind: 'marker'` 固定） */
  registerMarkerVisibilityNode: RegisterCellVisibilityNode
  /**
   * `WaypointSelectLayer` の DOM を visibility registry へ登録する（`kind: 'waypoint'` 固定）
   *
   * - 全セルに存在するため `marker` と同一セルで衝突しうる（`marker` は
   *   `Map<NodeKind, HTMLElement>` で kind ごとに 1 要素しか持てず、GoalMarkerLayer
   *   等と同じセルに登録すると後勝ちで上書きされてしまう）ので独立した kind にする
   * - 視界外セルへも中継点を設置できてしまう見た目の不整合（実機検証で発見）を防ぐ
   */
  registerWaypointVisibilityNode: RegisterCellVisibilityNode
  /** `Stage07` の imperative API。経路に沿った自動移動を命令する */
  stage07HandleRef: RefObject<null | Stage07Handle>
  /** 設置済みの中継点 */
  waypoints: HexCell[]
  /** 中継点選択モード中か */
  waypointSelecting: boolean
}

/** セル単位の DOM を visibility registry へ登録する関数 */
type RegisterCellVisibilityNode = (
  cell: HexCell,
  el: HTMLElement | null,
) => void
