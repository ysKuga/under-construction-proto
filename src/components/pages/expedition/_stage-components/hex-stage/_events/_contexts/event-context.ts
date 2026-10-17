import { useContext } from 'react'

import { createRequiredContext } from '@/utils/create-required-context'

const { RequiredContext, useRequiredContext } =
  createRequiredContext<EventTarget>(
    'useStage07EventTarget should be used within <Stage07EventProvider>',
  )

/** stage-07 event 用 Context */
export const Stage07EventContext = RequiredContext

/** stage-07 event の発火対象 (EventTarget) を取得する */
export const useStage07EventTarget = (): EventTarget => useRequiredContext()

/**
 * stage-07 event の発火対象 (EventTarget) を取得する（Provider 外なら `null`）
 *
 * - `Stage07` 自身の発行用。Provider なしでも単体でマウントできるようにする
 */
export const useOptionalStage07EventTarget = (): EventTarget | null =>
  useContext(Stage07EventContext)
