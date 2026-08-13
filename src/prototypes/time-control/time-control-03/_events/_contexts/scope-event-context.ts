import { createRequiredContext } from '@/utils/create-required-context'

export const {
  Context: ScopeEventContext,
  useContextValue: useScopeEventTarget,
} = createRequiredContext<EventTarget>(
  'useScopeEventTarget should be used within <ScopeEventProvider>',
)
