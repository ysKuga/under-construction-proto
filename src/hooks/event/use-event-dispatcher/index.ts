import { useCallback } from 'react'

import { getPendingPromises } from '../_registries'

/**
 * EventTarget へイベントを発行する dispatcher を返す
 *
 * - 発行時点で登録中の listener が Promise を返した場合、戻り値の `Promise` は\
 *   その完了 (`Promise.all`) を待つ。fan-out (同一 type の複数 listener) 時も\
 *   全 listener の完了を待つ形で解決する
 *
 * @param target 発行対象。省略時 window
 */
export const useEventDispatcher = (target: EventTarget = window) =>
  useCallback(
    async (event: Event) => {
      target.dispatchEvent(event)
      await Promise.all(getPendingPromises(target, event.type))
    },
    [target],
  )
