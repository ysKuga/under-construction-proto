import { createRequiredContext } from '@/utils/create-required-context'

const { RequiredContext, useRequiredContext } =
  createRequiredContext<EventTarget>(
    'useScopeEventTarget should be used within <ScopeEventProvider>',
  )

/** scope event 用 Context */
export const ScopeEventContext = RequiredContext

/** scope event の発火対象 (EventTarget) を取得する */
export const useScopeEventTarget = (): EventTarget => useRequiredContext()
