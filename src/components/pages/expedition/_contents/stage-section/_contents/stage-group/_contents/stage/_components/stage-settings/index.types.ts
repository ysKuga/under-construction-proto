import { RefObject } from 'react'

export type UseStageSettingsReturn = {
  /** ピン留めボタンのクリック時。ピン留め ⇔ 解除を切り替える */
  handlePinClick: () => void
  /** ピン留め中か（外側クリック・Esc で閉じない） */
  pinned: boolean
  /** ポップオーバーの要素 */
  popoverRef: RefObject<HTMLDivElement | null>
}
