import { CAMERA_POSITION, ORBIT_TARGET } from './camera'

type Vec3 = readonly [number, number, number]

const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]]

const cross = (a: Vec3, b: Vec3): Vec3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
]

const normalize = (v: Vec3): Vec3 => {
  const len = Math.hypot(v[0], v[1], v[2])

  return [v[0] / len, v[1] / len, v[2] / len]
}

const dot = (a: Vec3, b: Vec3): number =>
  a[0] * b[0] + a[1] * b[1] + a[2] * b[2]

const WORLD_UP: Vec3 = [0, 1, 0]

/** カメラの視線(forward)・右(right)・上(camUp)の単位ベクトル(world) */
const FORWARD = normalize(sub(ORBIT_TARGET, CAMERA_POSITION))
const RIGHT = normalize(cross(FORWARD, WORLD_UP))
const CAM_UP = cross(RIGHT, FORWARD)

/**
 * yaw(rad)のとき、box-bot-01 の正面ベクトル(world (sinθ, 0, cosθ)、\
 * `readFacing` の定義に合わせた基準)が画面上どの角度に見えるかを返す
 *
 * - カメラの right/up ベクトルへ正面ベクトルを投影し、screen 座標(x: 右+、y: 下+)の\
 *   `atan2` を求める。斜め上から見下ろす遠近視点のため、yaw とこの画面角度の関係は\
 *   非線形(側面付近ほど画面角度の変化が小さい)
 */
const yawToScreenAngle = (yaw: number): number => {
  const v: Vec3 = [Math.sin(yaw), 0, Math.cos(yaw)]
  const screenX = dot(v, RIGHT)
  const screenYDown = -dot(v, CAM_UP)

  return Math.atan2(screenYDown, screenX)
}

/** 2 つの角度(rad)の最短差分を (-π, π] へ正規化して返す */
const angleDiff = (a: number, b: number): number => {
  const twoPi = Math.PI * 2
  let d = (a - b) % twoPi

  if (d > Math.PI) d -= twoPi
  if (d < -Math.PI) d += twoPi

  return d
}

/** 探索の角度分解能(0.5° 刻み) */
const SCAN_STEPS = 720

/**
 * 画面角度(rad、atan2 基準: 0 = 右、π/2 = 下)から、その方向を向いて見える\
 * box-bot-01 の yaw(rad)を数値的に逆算する
 *
 * - `yawToScreenAngle` が非線形のため解析的に解けない。0.5° 刻みで yaw 全域を走査し、\
 *   画面角度が最も近い yaw を返す(実行はセル移動クリック時のみ、コストは無視できる)
 *
 * @param screenAngle 向かせたい画面上の角度(rad)
 */
export const screenAngleToYaw = (screenAngle: number): number => {
  let bestYaw = 0
  let bestAbsDiff = Infinity

  for (let i = 0; i < SCAN_STEPS; i++) {
    const yaw = (i / SCAN_STEPS) * Math.PI * 2
    const absDiff = Math.abs(angleDiff(yawToScreenAngle(yaw), screenAngle))

    if (absDiff < bestAbsDiff) {
      bestAbsDiff = absDiff
      bestYaw = yaw
    }
  }

  return bestYaw
}
