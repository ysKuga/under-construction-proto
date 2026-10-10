import { ReactNode } from 'react'

import { HexCell } from '@/prototypes/stage/stage-07/_lib/hex'

/** セル情報パネルへ表示する要素1件 */
export type CellInfoEntry = {
  /** 説明文言 */
  description: string
  /** 表示アイコン */
  icon: ReactNode
  /** 一覧の key */
  key: string
  /** 状態（EN スポットの残り回数等。無ければ省略） */
  status?: string
}

export type UseCellInfoPanelReturn = {
  /** hover 中セルの内包要素一覧 */
  entries: CellInfoEntry[]
  /** 操作ヒント（目標キャンセル等。無ければ省略） */
  hint?: string
  /** hover 中のセル（hover なしは `undefined`） */
  hoveredCell: HexCell | undefined
}
