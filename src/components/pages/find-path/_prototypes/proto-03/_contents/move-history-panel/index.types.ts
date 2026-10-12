/** 履歴一覧の 1 行 */
export type MoveHistoryRow = {
  /** React の key（履歴内の位置） */
  key: number
  /** 表示文言 */
  label: string
}

export type UseMoveHistoryPanelReturn = {
  /** 手数（リセットをまたいだ通算） */
  moveCount: number
  /** 履歴一覧（新しい順、直近 `MOVE_HISTORY_DISPLAY_LIMIT` 件） */
  rows: MoveHistoryRow[]
}
