'use client'

import { ChoicePanel } from '../../../../../../_components/choice-panel'

import { useChoicePanelContent } from './index.hooks'

/**
 * ステージの選択肢パネル（issue #393）
 *
 * - 経路提示中、実行・中継点・キャンセルを並べる
 * - 操作の拒否（`Expedition-action-rejected`）で揺れる
 * - 右端: `md` 未満は画面右端から 16px、`md` 以上はステージ（`--expedition-stage`）の右端
 */
export const ChoicePanelContent = () => {
  const { choicePanelRef, choices } = useChoicePanelContent()

  return (
    <ChoicePanel
      choices={choices}
      popoverClassName="md:[right:anchor(--expedition-stage_right)]"
      ref={choicePanelRef}
    />
  )
}
