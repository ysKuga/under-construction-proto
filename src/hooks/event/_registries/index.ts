/** target・type ごとの登録数 (多重登録検知用) */
const registeredCounts = new WeakMap<EventTarget, Map<string, number>>()

/** listener 登録数を1増やす。`allowMultiple` が false で登録済みなら throw する */
export const registerListener = (
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

/** listener 登録数を1減らす */
export const unregisterListener = (target: EventTarget, type: string) => {
  const counts = registeredCounts.get(target)
  const count = counts?.get(type) ?? 0

  if (count <= 1) {
    counts?.delete(type)
    return
  }

  counts?.set(type, count - 1)
}

/** target・type ごとの pending 変化 (登録数の増減) を購読する listener 一覧 */
const pendingChangeListeners = new WeakMap<
  EventTarget,
  Map<string, Set<() => void>>
>()

/** target・type の pending 変化を、購読中の listener 全員へ通知する */
const notifyPendingChange = (target: EventTarget, type: string) => {
  pendingChangeListeners
    .get(target)
    ?.get(type)
    ?.forEach((listener) => listener())
}

/** target・type の pending 変化 (`notifyPendingChange`) を購読する。解除関数を返す */
export const subscribePendingChange = (
  target: EventTarget,
  type: string,
  listener: () => void,
) => {
  const types =
    pendingChangeListeners.get(target) ?? new Map<string, Set<() => void>>()
  const listeners = types.get(type) ?? new Set<() => void>()
  listeners.add(listener)
  types.set(type, listeners)
  pendingChangeListeners.set(target, types)

  return () => {
    listeners.delete(listener)
  }
}

/** target・type ごとの実行中 handler Promise (dispatcher が完了を待つため) */
const pendingPromises = new WeakMap<EventTarget, Map<string, Promise<void>[]>>()

/** target・type に実行中 Promise を1件登録する */
export const registerPendingPromise = (
  target: EventTarget,
  type: string,
  promise: Promise<void>,
) => {
  const promises =
    pendingPromises.get(target) ?? new Map<string, Promise<void>[]>()
  promises.set(type, [...(promises.get(type) ?? []), promise])
  pendingPromises.set(target, promises)
  notifyPendingChange(target, type)
}

/** target・type から完了した Promise を1件除去する */
export const unregisterPendingPromise = (
  target: EventTarget,
  type: string,
  promise: Promise<void>,
) => {
  const promises = pendingPromises.get(target)?.get(type)
  promises?.splice(promises.indexOf(promise), 1)
  notifyPendingChange(target, type)
}

/** dispatcher が type 発行直後に読む、実行中の handler Promise 一覧 */
export const getPendingPromises = (target: EventTarget, type: string) =>
  pendingPromises.get(target)?.get(type) ?? []
