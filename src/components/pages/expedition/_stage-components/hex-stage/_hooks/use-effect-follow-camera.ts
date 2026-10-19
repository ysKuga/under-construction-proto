import { RefObject, useEffect } from 'react'

import { PLAYER_ACTOR_ID } from '../constants'

import { useActorsStoreApi } from '../_stores/actors'

/**
 * 表示領域の中心へ player bot を合わせるよう、scene を毎フレーム平行移動する（カメラの追従）
 *
 * - player のアンカー(bot の位置決め div)の `getBoundingClientRect` を実測し、表示領域の中心との差を
 *   scene の `transform` へ直書きする。セル間移動(CSS transition)・床の tilt 変更のどちらにも実測で追従する
 * - 盤面の端でも止めず、常に bot を中心へ置く（吹き出しを表示領域の外へ出さないため）
 * - 差が 0.5px 未満なら書込みをスキップする
 *
 * @param viewportRef 表示領域の要素の ref
 * @param sceneRef 平行移動させる scene の要素の ref
 */
export const useEffectFollowCamera = (
  viewportRef: RefObject<HTMLDivElement | null>,
  sceneRef: RefObject<HTMLDivElement | null>,
) => {
  const actorsStoreApi = useActorsStoreApi()

  useEffect(() => {
    // rAF ループで player の位置を実測し、scene の transform へ反映する
    /** scene へ適用中の平行移動量 X (px) */
    let offsetX = 0
    /** scene へ適用中の平行移動量 Y (px) */
    let offsetY = 0
    /** rAF の ID */
    let handle = 0

    const tick = () => {
      const viewport = viewportRef.current
      const scene = sceneRef.current
      const anchor = actorsStoreApi.getState().overlayAnchors[PLAYER_ACTOR_ID]

      if (viewport && scene && anchor) {
        const viewportRect = viewport.getBoundingClientRect()
        const anchorRect = anchor.getBoundingClientRect()
        /** bot の中心から表示領域の中心までの差 X (px) */
        const dx =
          viewportRect.left +
          viewportRect.width / 2 -
          (anchorRect.left + anchorRect.width / 2)
        /** bot の中心から表示領域の中心までの差 Y (px) */
        const dy =
          viewportRect.top +
          viewportRect.height / 2 -
          (anchorRect.top + anchorRect.height / 2)

        /** 表示領域の中心と bot の中心の差が、書込みのしきい値以上か */
        const isOffCenter = Math.abs(dx) >= 0.5 || Math.abs(dy) >= 0.5

        // 中心からずれている: scene の transform を更新する
        if (isOffCenter) {
          offsetX += dx
          offsetY += dy
          scene.style.transform = `translate(${offsetX}px, ${offsetY}px)`
        }
      }

      handle = requestAnimationFrame(tick)
    }

    handle = requestAnimationFrame(tick)

    return () => cancelAnimationFrame(handle)
  }, [actorsStoreApi, sceneRef, viewportRef])
}
