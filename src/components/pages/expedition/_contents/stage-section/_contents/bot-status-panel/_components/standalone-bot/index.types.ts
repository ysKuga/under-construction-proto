/** 独立 bot の表示値 */
export type UseStandaloneBotReturn = {
  /** 表示領域(Canvas)の高さ px。EN 切れで拡大した接地影が見切れないよう設置領域より縦へ伸ばす */
  canvasHeight: number
  /** 独立 bot の EventTarget。ステージ上の bot 宛ての action を中継する */
  standaloneBotEventTarget: EventTarget
  /** 独立 bot の一辺 px（画面幅で切替） */
  standaloneBotSize: number
}
