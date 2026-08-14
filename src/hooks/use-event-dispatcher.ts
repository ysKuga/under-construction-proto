import { useCallback } from 'react'

/**
 * EventTarget へイベントを発行する dispatcher を返す
 *
 * @param target 発行対象。省略時 window
 */
export const useEventDispatcher = (target: EventTarget = window) =>
  useCallback((event: Event) => target.dispatchEvent(event), [target])
