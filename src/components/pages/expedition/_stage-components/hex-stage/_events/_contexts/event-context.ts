import { useContext } from 'react'

import { createRequiredContext } from '@/utils/create-required-context'

const { RequiredContext, useRequiredContext } =
  createRequiredContext<EventTarget>(
    'useHexStageEventTarget should be used within <HexStageEventProvider>',
  )

/** hex-stage event 用 Context */
export const HexStageEventContext = RequiredContext

/** hex-stage event の発火対象 (EventTarget) を取得する */
export const useHexStageEventTarget = (): EventTarget => useRequiredContext()

/**
 * hex-stage event の発火対象 (EventTarget) を取得する（Provider 外なら `null`）
 *
 * - `HexStage` 自身の発行用。Provider なしでも単体でマウントできるようにする
 */
export const useOptionalHexStageEventTarget = (): EventTarget | null =>
  useContext(HexStageEventContext)
