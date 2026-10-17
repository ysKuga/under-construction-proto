import { memo, useRef } from 'react'

import { useActorsStore } from '../../_stores/actors'

import { useEffectFollowOverlayAnchors } from './_hooks/use-effect-follow-overlay-anchors'

/**
 * actor ごとのオーバーレイ注入用コンテナを floor の 3D 空間外に並べるレイヤー
 *
 * - floor(`rotateX` + `preserve-3d`)内に置くと、ブラウザの奥行きヒットテストで
 *   `GeoLayer` のセルにクリックを奪われる(見た目の重なり順に従わない)ため、
 *   floor の外(scene の後ろ)へ配置する（issue #137）
 * - `ActorsLayer` が登録したアンカーごとにコンテナを用意し、`registerOverlayContainer`
 *   で store へ登録する。呼び出し側は `overlayContainers[actorId]` へ `createPortal`
 *   で要素を注入する
 * - コンテナの原点はアンカー(bot の位置決め div)の画面上の左上。追従は
 *   `useEffectFollowOverlayAnchors` が rAF で実測して行う。floor の外にあるため
 *   tilt・perspective の影響は受けない(遠近による拡縮もしない)
 * - レイヤー自身は大きさ 0 で、下の要素のクリックを妨げない
 */
export const ActorOverlayLayer = memo(() => {
  const overlayAnchors = useActorsStore((state) => state.overlayAnchors)
  const registerOverlayContainer = useActorsStore(
    (state) => state.registerOverlayContainer,
  )
  /** コンテナ群の座標原点となるレイヤー要素 */
  const layerRef = useRef<HTMLDivElement>(null)

  useEffectFollowOverlayAnchors(layerRef)

  return (
    <div ref={layerRef} style={{ left: 0, position: 'absolute', top: 0 }}>
      {Object.keys(overlayAnchors).map((actorId) => (
        <div
          key={actorId}
          ref={(el) => registerOverlayContainer(actorId, el)}
          style={{
            left: 0,
            pointerEvents: 'none',
            position: 'absolute',
            top: 0,
          }}
        />
      ))}
    </div>
  )
})

ActorOverlayLayer.displayName = 'ActorOverlayLayer'
