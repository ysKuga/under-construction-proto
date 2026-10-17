import { RefObject } from 'react'

import { WaypointBubbleHandle } from '../../../../_components/waypoint-bubble'

export type UseWaypointBubbleContentReturn = {
  /**
   * 中継点の吹き出しクリック時。中継点選択モードを切り替える
   *
   * - 経路提示中(`proposing`)なら選択を開始する
   * - 選択中ならキャンセルし、設置した中継点を消して `proposing` へ戻す\
   *   （中継点を残す確定は操作パネルの「完了」）
   */
  handleClick: () => void
  /**
   * `WaypointBubble` の imperative API
   *
   * - `selectable`(思考吹き出し⇔発言吹き出しの切替)・半透明化を ref 経由で命令する
   */
  waypointBubbleRef: RefObject<null | WaypointBubbleHandle>
}
