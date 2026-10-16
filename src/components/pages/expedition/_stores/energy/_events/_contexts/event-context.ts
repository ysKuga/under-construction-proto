import { createRequiredContext } from '@/utils/create-required-context'

const { RequiredContext, useRequiredContext } =
  createRequiredContext<EventTarget>(
    'useEnergyEventTarget should be used within <EnergyEventProvider>',
  )

/** energy event 用 Context */
export const EnergyEventContext = RequiredContext

/** energy event の発火対象 (EventTarget) を取得する */
export const useEnergyEventTarget = (): EventTarget => useRequiredContext()
