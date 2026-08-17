import { createRequiredContext } from '@/utils/create-required-context'

export const {
  RequiredContext: ScopeEventContext,
  useRequiredContext: useScopeEventTarget,
} = createRequiredContext<EventTarget>(
  'useScopeEventTarget should be used within <ScopeEventProvider>',
)
