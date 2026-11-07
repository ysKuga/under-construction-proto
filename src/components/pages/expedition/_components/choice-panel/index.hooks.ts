import { ForwardedRef } from 'react'

import { useCloseOnEscape } from './_hooks/use-close-on-escape'
import { useEffectSyncPopoverOpen } from './_hooks/use-effect-sync-popover-open'
import { useImperativeShake } from './_hooks/use-imperative-shake'
import { usePanelOpen } from './_hooks/use-panel-open'
import {
  ChoicePanelHandle,
  ChoicePanelProps,
  UseChoicePanelReturn,
} from './index.types'

/**
 * 選択肢パネルの開閉・揺れをまとめる
 *
 * @param props パネルの props
 * @param ref 呼び出し元の ref（揺れの命令を公開する）
 */
export const useChoicePanel = (
  props: ChoicePanelProps,
  ref: ForwardedRef<ChoicePanelHandle>,
): UseChoicePanelReturn => {
  const panelOpen = usePanelOpen(props)

  useEffectSyncPopoverOpen(panelOpen.popoverRef, panelOpen.open)
  useCloseOnEscape(panelOpen.popoverRef, panelOpen.close, panelOpen.pinned)
  useImperativeShake(ref, panelOpen.popoverRef)

  return panelOpen
}
