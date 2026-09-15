import type { Vec3 } from '../index.types'

/**
 * カメラ位置・注視点(world)
 *
 * - `index.tsx`(Canvas の camera prop)と `screen-facing.ts`(画面角度⇔yaw の投影計算)
 *   の双方が同じ値を参照する必要があるため、ここへ切り出す
 */
export const CAMERA_POSITION: Vec3 = [3.6, 2.2, 5.4]

/**
 * OrbitControls の注視点(world)
 *
 * - Canvas を bot ぴったりに縮めたため、直立 bot が Canvas 中央へ来るよう較正した値
 * - fall 時の下部見切れ対策は #108 フェーズ1 で別途
 */
export const ORBIT_TARGET: Vec3 = [0, 0.32, 0]
