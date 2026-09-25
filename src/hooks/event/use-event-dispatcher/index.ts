import { useCallback } from 'react'

import { getPendingPromises } from '../_registries'

/**
 * EventTarget へイベントを発行する dispatcher を返す
 *
 * - 発行時点で登録中の listener が Promise を返した場合、戻り値の `Promise` は\
 *   その完了 (`Promise.all`) を待つ。fan-out (同一 type の複数 listener) 時も\
 *   全 listener の完了を待つ形で解決する
 * - 戻り値は `dispatchEvent` の結果。`cancelable: true` の event を listener が\
 *   `preventDefault()` した場合 `false` になる(listener 側による実行拒否の判定に使う)
 * - イベント名には scope prefix (例: `ComponentName-`) の付与を検討する(grep 検索性のため)
 *
 * @param target 発行対象 (省略時 window)
 */
export const useEventDispatcher = (target: EventTarget = window) =>
  useCallback(
    /**
     * @param event 発行するイベント。Event オブジェクトまたはイベント名文字列
     */
    async (event: Event | string): Promise<boolean> => {
      const _event = typeof event === 'string' ? new Event(event) : event

      const accepted = target.dispatchEvent(_event)
      await Promise.all(getPendingPromises(target, _event.type))

      return accepted
    },
    [target],
  )
