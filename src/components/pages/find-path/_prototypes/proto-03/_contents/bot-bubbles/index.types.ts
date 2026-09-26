import { RefObject } from 'react'

import { ExecuteBubbleHandle } from '../../_components/execute-bubble'
import { WaypointBubbleHandle } from '../../_components/waypoint-bubble'

export type UseBotBubblesReturn = {
  /** `ExecuteBubble` の imperative API。半透明化を ref 経由で命令する */
  executeBubbleRef: RefObject<ExecuteBubbleHandle | null>
  /** 「実行」吹き出しクリック時。表示中の経路に沿って自動移動を開始する */
  handleExecuteClick: () => Promise<void>
  /** 中継点の吹き出しクリック時。中継点選択モードを切り替える */
  handleWaypointBubbleClick: () => void
  /**
   * player bot 用のオーバーレイ注入先コンテナ DOM（actors store）
   *
   * - `Stage07` の `ActorOverlayLayer` が floor の 3D 空間外に用意し、bot の画面上の
   *   位置へ追従させる。吹き出しをここへ `createPortal` で注入する（issue #137）
   */
  playerOverlayContainer?: HTMLDivElement
  /** 吹き出しを表示するか（中継点フローが `idle` 以外） */
  visible: boolean
  /**
   * `WaypointBubble` の imperative API
   *
   * - `selectable`(思考吹き出し⇔発言吹き出しの切替)を props でなくこの ref 経由で
   *   命令する（`WaypointBubbleHandle` 内コメント参照）
   */
  waypointBubbleRef: RefObject<null | WaypointBubbleHandle>
}
