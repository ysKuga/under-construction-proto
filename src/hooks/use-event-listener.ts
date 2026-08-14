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

/**
 * EventTarget のイベントを購読する
 *
 * @param type イベント名
 * @param handler イベント発火時に呼ぶ処理
 * @param options 購読対象・多重登録許可の指定
 */
export const useEventListener = <E extends Event = Event>(
  type: string,
  handler: (event: E) => void,
  options: UseEventListenerOptions = {},
) => {
  const { allowMultiple = false, target = window } = options

  // target へ listener を登録、cleanup で解除
  useEffect(() => {
    registerListener(target, type, allowMultiple)

    const listener = (event: Event) => handler(event as E)

    target.addEventListener(type, listener)

    return () => {
      target.removeEventListener(type, listener)
      unregisterListener(target, type)
    }
  }, [target, type, handler, allowMultiple])
}
