import { ComponentType } from 'react'
import { StoreApi } from 'zustand/vanilla'

/** スロットへ格納する吹き出しが受け取る props */
export type BubbleSlotBubbleProps = {
  /** クリック時 */
  onClick: () => void
  /** close ボタン(×)クリック時（close ボタンを持つ吹き出しのみ使う） */
  onClose: () => void
  /** 表示するか */
  visible: boolean
}

/** スロットへ格納する吹き出し 1 つ */
export type BubbleSlotEntry = {
  /** 吹き出しのコンポーネント */
  Bubble: ComponentType<BubbleSlotBubbleProps>
  /** 吹き出しの識別子。表示制御の対象指定に使う */
  id: string
  /** 表示するか */
  visible: boolean
}

export type BubbleSlotsStore = StoreApi<BubbleSlotsStoreState>

/** スロットへ格納する吹き出しと、その表示制御状態を保持する store */
export type BubbleSlotsStoreState = {
  /** 格納する吹き出し。先頭から順にスロットの位置へ置く */
  bubbles: BubbleSlotEntry[]
  /**
   * 吹き出しの表示を切り替える
   *
   * @param id 対象の吹き出しの識別子
   * @param visible 表示するか
   */
  setVisible: (id: string, visible: boolean) => void
}
