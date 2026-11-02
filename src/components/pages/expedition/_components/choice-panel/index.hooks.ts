import { useEffectSyncPopoverOpen } from './_hooks/use-effect-sync-popover-open'
import { usePanelOpen } from './_hooks/use-panel-open'
import { ChoicePanelProps, UseChoicePanelReturn } from './index.types'

/** 選択肢パネルの開閉をまとめる */
export const useChoicePanel = (
  props: ChoicePanelProps,
): UseChoicePanelReturn => {
  const panelOpen = usePanelOpen(props)

  useEffectSyncPopoverOpen(panelOpen.popoverRef, panelOpen.open)

  return panelOpen
}
