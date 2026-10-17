import { createRequiredContext } from '@/utils/create-required-context'

const { RequiredContext, useRequiredContext } =
  createRequiredContext<EventTarget>(
    'useFindPathEventTarget should be used within <FindPathEventProvider>',
  )

/** find-path event 用 Context */
export const FindPathEventContext = RequiredContext

/** find-path event の発火対象 (EventTarget) を取得する */
export const useFindPathEventTarget = (): EventTarget => useRequiredContext()
