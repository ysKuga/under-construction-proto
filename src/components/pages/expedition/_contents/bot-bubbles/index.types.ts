import { BubbleSlotEntry } from '../../_components/bubble-slots/_stores/bubble-slots/types'

export type UseBotBubblesReturn = {
  /** 目標セル上へ格納する吹き出し */
  objectiveBubbles: BubbleSlotEntry[]
  /** bot 頭上へ格納する吹き出し */
  playerBubbles: BubbleSlotEntry[]
}
