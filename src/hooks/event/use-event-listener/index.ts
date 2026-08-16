import { useEffect } from 'react'

import {
  registerListener,
  registerPendingPromise,
  unregisterListener,
  unregisterPendingPromise,
} from '../_registries'

/**
 * useEventListener のオプション
 */
export type UseEventListenerOptions = {
  /** true 指定時のみ、同一 target・type の重複登録を許可する。省略時 false */
  allowMultiple?: boolean
  /** 購読対象。省略時 window */
  target?: EventTarget
}

/**
 * EventTarget のイベントを購読する
 *
 * - イベント名には scope prefix (例: `ComponentName-`) の付与を検討する(grep 検索性のため)
 *
 * @param type イベント名
 * @param handler イベント発火時に呼ぶ処理。Promise を返す場合、dispatcher の\
 *   戻り値 (`useEventDispatcher`) がその完了を待つ
 * @param options 購読対象・多重登録許可の指定
 */
export const useEventListener = <E extends Event = Event>(
  type: string,
  handler: (event: E) => Promise<void> | void,
  options: UseEventListenerOptions = {},
) => {
  const { allowMultiple = false, target = window } = options

  // target へ listener を登録、cleanup で解除
  useEffect(() => {
    registerListener(target, type, allowMultiple)

    const listener = (event: Event) => {
      const result = handler(event as E)

      if (result instanceof Promise) {
        registerPendingPromise(target, type, result)
        void result.finally(() =>
          unregisterPendingPromise(target, type, result),
        )
      }
    }

    target.addEventListener(type, listener)

    return () => {
      target.removeEventListener(type, listener)
      unregisterListener(target, type)
    }
  }, [target, type, handler, allowMultiple])
}
