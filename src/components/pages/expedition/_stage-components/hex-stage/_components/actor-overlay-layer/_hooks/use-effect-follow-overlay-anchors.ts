import { RefObject, useEffect } from 'react'

import { useActorsStoreApi } from '../../../_stores/actors'

/**
 * 各 actor のオーバーレイコンテナを、対応するアンカーの画面上の位置へ毎フレーム追従させる
 *
 * - アンカー(floor の 3D 空間内、bot の位置決め div 内)の `getBoundingClientRect`
 *   から `layerRef` 基準の相対座標を求め、コンテナの `transform` へ直書きする。
 *   bot のセル間移動(CSS transition)・floor の tilt 変更のどちらにも、
 *   CSS の継承でなく実測で追従する
 * - 子要素を持たないコンテナ(注入なし)は計測をスキップする
 * - 前回と同じ値なら書込みをスキップする
 *
 * @param layerRef コンテナ群の親(座標原点)となる要素の ref
 */
export const useEffectFollowOverlayAnchors = (
  layerRef: RefObject<HTMLDivElement | null>,
) => {
  const actorsStoreApi = useActorsStoreApi()

  useEffect(() => {
    // rAF ループでアンカー位置を実測し、コンテナの transform へ反映する
    const lastTransforms = new Map<HTMLDivElement, string>()
    let handle = 0

    const tick = () => {
      const layer = layerRef.current
      const { overlayAnchors, overlayContainers } = actorsStoreApi.getState()

      if (layer) {
        const layerRect = layer.getBoundingClientRect()

        for (const [actorId, container] of Object.entries(overlayContainers)) {
          const anchor = overlayAnchors[actorId]

          if (!container || !anchor || container.childElementCount === 0) {
            continue
          }

          const anchorRect = anchor.getBoundingClientRect()
          const transform = `translate(${anchorRect.left - layerRect.left}px, ${anchorRect.top - layerRect.top}px)`

          if (lastTransforms.get(container) !== transform) {
            container.style.transform = transform
            lastTransforms.set(container, transform)
          }
        }
      }

      handle = requestAnimationFrame(tick)
    }

    handle = requestAnimationFrame(tick)

    return () => cancelAnimationFrame(handle)
  }, [actorsStoreApi, layerRef])
}
