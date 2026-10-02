import { ComponentType } from 'react'
import { Observable } from 'rxjs'
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
  /**
   * 表示中に隠す吹き出しの種類
   *
   * - ここに含まれる種類を `kinds` に持つ吹き出しは、この吹き出しの表示中は非表示になる
   */
  hides?: string[]
  /** 吹き出しの識別子。表示制御の対象指定に使う */
  id: string
  /** 吹き出しの種類。他の吹き出しの `hides` による排他の対象指定に使う */
  kinds?: string[]
  /**
   * 表示条件を満たすかの流れ
   *
   * - 最初の値が流れるまでは非表示とする
   */
  visible$: Observable<boolean>
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
  /** 吹き出しの識別子ごとの表示状態。未登録の識別子は非表示 */
  visibility: Record<string, boolean>
}
