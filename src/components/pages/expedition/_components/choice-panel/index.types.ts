import { RefObject } from 'react'

/** パネルへ並べる選択肢 1 つ */
export type Choice = {
  /** 選択肢の識別子。描画の key に使う */
  id: string
  /** 表示する文言 */
  label: string
  /** 選択時 */
  onSelect: () => void
  /** 押下中の表示にするか（`aria-pressed`）。未指定なら押下の状態を持たない */
  pressed?: boolean
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
  /** パネルを閉じる */
  close: () => void
  /** パネルが開いているか */
  open: boolean
  /** パネル（ポップオーバー）の要素 */
  popoverRef: RefObject<HTMLDivElement | null>
  /** 呼び出しボタンのクリック時。開閉を切り替える */
  toggle: () => void
}
