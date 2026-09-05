'use client'

import { Html } from '@react-three/drei'

import { Button } from '@/components/ui/button'

import { ACTION_LABELS } from '../_constants/action-labels'

/** リング半径(world 単位)。bot 本体の奥行き・カメラ距離から目視調整した仮値 */
const RING_RADIUS = 2.4

/** リングの高さ(world y 座標)。box-bot の接地面(GROUND_POSITION.y = -1.42)付近 */
const RING_Y = -1.42

/**
 * ActionRing — bot の足元、地面に水平なリング上にボタンを配置する配置パターン
 *
 * - r3f Canvas 内でのみ使用可能。`BoxBot` の `children` として渡す(`../../index.tsx` 参照)
 * - `@react-three/drei` の `Html` で 3D 座標→スクリーン座標の投影を行う。box-bot 本体の改修は不要\
 *   (`children` が Canvas 内へそのまま展開される前提を利用、`../CLAUDE.md` 参照)
 * - カメラが正面よりやや見下ろす角度のため、リングは遠近法で潰れた楕円に見える(意図した見た目)
 */
export const ActionRing = () => {
  return (
    <>
      {ACTION_LABELS.map((label, i) => {
        const angle = (i / ACTION_LABELS.length) * 2 * Math.PI
        const x = RING_RADIUS * Math.cos(angle)
        const z = RING_RADIUS * Math.sin(angle)

        return (
          <Html center key={label} occlude position={[x, RING_Y, z]}>
            <Button type="button" variant="outline">
              {label}
            </Button>
          </Html>
        )
      })}
    </>
  )
}
