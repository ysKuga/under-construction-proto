import { createRequiredContext } from '@/utils/create-required-context'

const { RequiredContext, useRequiredContext } =
  createRequiredContext<EventTarget>(
    'useExpeditionEventTarget should be used within <ExpeditionEventProvider>',
  )

/** expedition event 用 Context */
export const ExpeditionEventContext = RequiredContext

/** expedition event の発火対象 (EventTarget) を取得する */
export const useExpeditionEventTarget = (): EventTarget => useRequiredContext()
