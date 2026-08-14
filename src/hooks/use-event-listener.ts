import { useEffect } from 'react'

/**
 * useEventListener のオプション
 */
export type UseEventListenerOptions = {
  /** true 指定時のみ、同一 target・type の重複登録を許可する。省略時 false */
  allowMultiple?: boolean
  /** 購読対象。省略時 window */
  target?: EventTarget
}

/** target・type ごとの登録数 (多重登録検知用) */
const registeredCounts = new WeakMap<EventTarget, Map<string, number>>()

const registerListener = (
  target: EventTarget,
  type: string,
  allowMultiple: boolean,
) => {
  const counts = registeredCounts.get(target) ?? new Map<string, number>()
  const count = counts.get(type) ?? 0

  if (count > 0 && !allowMultiple) {
    throw new Error(
      `useEventListener: "${type}" は既に登録済み。多重登録するには options.allowMultiple を true にしてください`,
    )
  }

  counts.set(type, count + 1)
  registeredCounts.set(target, counts)
}

const unregisterListener = (target: EventTarget, type: string) => {
  const counts = registeredCounts.get(target)
  const count = counts?.get(type) ?? 0

  if (count <= 1) {
    counts?.delete(type)
    return
  }

  counts?.set(type, count - 1)
}

/** target・type ごとの実行中 handler Promise (dispatcher が完了を待つため) */
const pendingPromises = new WeakMap<EventTarget, Map<string, Promise<void>[]>>()

const registerPendingPromise = (
  target: EventTarget,
  type: string,
  promise: Promise<void>,
) => {
  const promises =
    pendingPromises.get(target) ?? new Map<string, Promise<void>[]>()
  promises.set(type, [...(promises.get(type) ?? []), promise])
  pendingPromises.set(target, promises)
}

const unregisterPendingPromise = (
  target: EventTarget,
  type: string,
  promise: Promise<void>,
) => {
  const promises = pendingPromises.get(target)?.get(type)
  promises?.splice(promises.indexOf(promise), 1)
}

/** dispatcher が type 発行直後に読む、実行中の handler Promise 一覧 */
export const getPendingPromises = (target: EventTarget, type: string) =>
  pendingPromises.get(target)?.get(type) ?? []

/**
 * EventTarget のイベントを購読する
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
