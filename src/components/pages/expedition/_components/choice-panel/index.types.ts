import { ReactNode, RefObject } from 'react'

/** パネルへ並べる選択肢 1 つ */
export type Choice = {
  /**
   * 選択肢の識別子。描画の key に使う
   *
   * - 前回と同じ id が 1 つも残らない時にパネルを開く。開き直したい時（内容の再提示）は id を変える
   */
  id: string
  /** 表示する文言 */
  label: ReactNode
  /** 選択時 */
  onSelect: () => void
  /** 押下中の表示にするか（`aria-pressed`）。未指定なら押下の状態を持たない */
  pressed?: boolean
}

/** `ChoicePanel` が呼び出し元へ公開する imperative API */
export type ChoicePanelHandle = {
  /** パネルを左右に小刻みに揺らす（操作の拒否を知らせる） */
  shake: () => void
}

export type ChoicePanelProps = {
  /** 並べる選択肢。空なら「選択肢なし」を表示する */
  choices: Choice[]
  /**
   * パネル（ポップオーバー）へ足す class
   *
   * - 右端の位置の上書き（`md:[right:anchor(...)]` 等）に使う
   */
  popoverClassName?: string
}

export type UseChoicePanelReturn = {
  /** パネルを閉じる。ピン留めも外す */
  close: () => void
  /** ピン留めボタンのクリック時。ピン留め ⇔ 解除を切り替える */
  handlePinClick: () => void
  /** パネルが開いているか */
  open: boolean
  /** ピン留め中か（外側のクリック・Esc で閉じない） */
  pinned: boolean
  /** パネル（ポップオーバー）の要素 */
  popoverRef: RefObject<HTMLDivElement | null>
  /** 呼び出しボタンのクリック時。開閉を切り替える */
  toggle: () => void
}
