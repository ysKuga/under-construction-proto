export type UseStatusPanelReturn = {
  /** ゴールへ到達済みか */
  goalReached: boolean
  /** 「完了」クリック時。中継点選択モードを終了し経路提示中へ戻る */
  handleWaypointDoneClick: () => void
  /** 中継点選択モード中か */
  isSelectingWaypoint: boolean
  /** 設置済みの中継点の数 */
  waypointCount: number
}
