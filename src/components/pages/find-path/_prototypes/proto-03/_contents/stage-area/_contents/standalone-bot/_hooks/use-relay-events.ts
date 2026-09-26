import { useEffect } from 'react'

/**
 * `source` へ dispatch されたイベントのうち `types` に含むものを `target` へ再送する
 *
 * - 独立 bot へ、ステージ上の bot 宛ての action を選んで同期するために使う（issue #248）
 * - `detail` を引き継いだ新しい `CustomEvent` を dispatch する（dispatch 中の Event は再送不可のため）
 * - `useEventListener` を使わず `addEventListener` で直接購読する。`useEventListener` は
 *   同一 target・type の多重登録を既定で禁止しており、中継の購読が先に登録されると
 *   後から attach される bot 側の action listener が登録エラーになるため
 *
 * @param source 購読元
 * @param target 再送先
 * @param types 再送するイベント名
 */
export const useRelayEvents = (
  source: EventTarget,
  target: EventTarget,
  types: readonly string[],
) => {
  // 呼び出し側が types を毎回新規配列リテラルで渡すため、内容を dep にする
  const typesKey = types.join('|')

  useEffect(() => {
    // types の各イベントを source で購読し target へ再送、cleanup で解除
    const relay = (event: Event) => {
      target.dispatchEvent(
        new CustomEvent(event.type, {
          detail: (event as CustomEvent).detail,
        }),
      )
    }
    const typeList = typesKey.split('|')

    typeList.forEach((type) => source.addEventListener(type, relay))

    return () => {
      typeList.forEach((type) => source.removeEventListener(type, relay))
    }
  }, [source, target, typesKey])
}
