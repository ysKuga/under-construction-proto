import { useEffect } from 'react'

/**
 * EventTarget のイベントを購読する
 *
 * @param type イベント名
 * @param handler イベント発火時に呼ぶ処理
 * @param target 購読対象。省略時 window
 */
export const useEventListener = <E extends Event = Event>(
  type: string,
  handler: (event: E) => void,
  target: EventTarget = window,
) => {
  // target へ listener を登録、cleanup で解除
  useEffect(() => {
    const listener = (event: Event) => handler(event as E)

    target.addEventListener(type, listener)

    return () => target.removeEventListener(type, listener)
  }, [target, type, handler])
}
