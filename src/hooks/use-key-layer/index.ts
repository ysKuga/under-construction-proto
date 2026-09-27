import { useEffect, useRef } from 'react'

/**
 * キー押下時の処理
 *
 * - `false` を返すと処理せずに 1 つ下の層へ回す。それ以外は処理済みとして打ち切る
 */
export type KeyLayerHandler = (event: KeyboardEvent) => boolean | void

/**
 * useKeyLayer のオプション
 */
export type UseKeyLayerOptions = {
  /** 層を登録するか。true になった時点で最上位へ積み、false で外す。省略時 true */
  enabled?: boolean
}

/** 層。handler の差替えで積み順が変わらないよう ref で持つ */
type KeyLayer = { handlerRef: { current: KeyLayerHandler } }

/** key ごとの層（末尾が最上位） */
const layerStacks = new Map<string, KeyLayer[]>()

/** 最上位の層から順に処理させ、処理済みになった時点で打ち切る */
const handleKeyDown = (event: KeyboardEvent) => {
  if (event.isComposing) return

  const stack = layerStacks.get(event.key)

  if (!stack) return

  // handler 内で層が増減しても今回の押下の走査対象は変えない
  for (const layer of [...stack].reverse()) {
    if (layer.handlerRef.current(event) !== false) return
  }
}

/** 層を最上位へ積む。最初の層なら window へ listener を登録する */
const pushLayer = (key: string, layer: KeyLayer) => {
  if (layerStacks.size === 0) {
    window.addEventListener('keydown', handleKeyDown)
  }

  layerStacks.set(key, [...(layerStacks.get(key) ?? []), layer])
}

/** 層を外す。層がなくなれば window の listener を解除する */
const removeLayer = (key: string, layer: KeyLayer) => {
  const rest = (layerStacks.get(key) ?? []).filter((item) => item !== layer)

  if (rest.length > 0) {
    layerStacks.set(key, rest)
  } else {
    layerStacks.delete(key)
  }

  if (layerStacks.size === 0) {
    window.removeEventListener('keydown', handleKeyDown)
  }
}

/**
 * キー押下の処理を層として積み、最上位の層にだけ処理させる
 *
 * - ESC 等の汎用キーを 1 つの操作が占有しないよう、key ごとに LIFO で管理する
 * - 登録は `enabled` の間のみ。状態から導いた条件を渡し、層を実際の状態と一致させる
 * - 1 回の押下で処理するのは、最上位から見て最初に `false` 以外を返した層のみ
 * - IME 変換中（`isComposing`）の押下は扱わない
 *
 * @param key 対象キー（`KeyboardEvent.key`）
 * @param handler 押下時の処理。`false` を返すと下の層へ回す
 * @param options 登録有無の指定
 */
export const useKeyLayer = (
  key: string,
  handler: KeyLayerHandler,
  options: UseKeyLayerOptions = {},
) => {
  const { enabled = true } = options

  const handlerRef = useRef(handler)

  // 最新の handler を層へ反映する（積み順は変えない）
  useEffect(() => {
    handlerRef.current = handler
  }, [handler])

  // enabled の間だけ層を積み、cleanup で外す
  useEffect(() => {
    if (!enabled) return

    const layer: KeyLayer = { handlerRef }

    pushLayer(key, layer)

    return () => {
      removeLayer(key, layer)
    }
  }, [enabled, key])
}
