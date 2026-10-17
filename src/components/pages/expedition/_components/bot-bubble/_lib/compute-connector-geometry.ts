/** コネクタ(丸の弧・三角形のしっぽ)の描画に使う座標一式 */
export type ConnectorGeometry = {
  /** 丸を配置する3点(弧上、bubble側→bot側の順。本体に近いほど半径 `r` が大きい) */
  dots: Dot[]
  /** 三角形のしっぽ(SVG `polygon` の `points` 属性値) */
  trianglePoints: string
}

/** 弧上に配置する丸1個(半径 `r` を持つ) */
type Dot = { r: number } & Point

/** 2D 座標 */
type Point = { x: number; y: number }

/** コネクタ(丸の弧)が bot 方向へ伸びる距離(px) */
const REACH_PX = 36
/** 弧の膨らみ量(px) */
const CURVE_PX = 13
/** 三角形のしっぽの先端が bot 方向へ伸びる距離(px)。本体近くに置くため丸の弧より短い */
const TRIANGLE_REACH_PX = 16
/** 三角形のしっぽの縦幅(px、先端から底辺まで) */
const TRIANGLE_LENGTH_PX = 10
/** 三角形のしっぽの横幅(px) */
const TRIANGLE_WIDTH_PX = 8
/** 丸を配置する媒介変数 `t`(弧上、bubble側→bot側の順) */
const DOT_TS = [0.25, 0.5, 0.75]
/** 丸の半径(px)。本体に最も近い丸の値 */
const DOT_RADIUS_NEAR_PX = 4
/** 丸の半径(px)。bot に最も近い丸の値 */
const DOT_RADIUS_FAR_PX = 1.8

/** 二次ベジェ曲線上、媒介変数 `t`(0〜1) の点を求める */
const bezierPoint = (
  start: Point,
  control: Point,
  end: Point,
  t: number,
): Point => ({
  x: (1 - t) ** 2 * start.x + 2 * (1 - t) * t * control.x + t ** 2 * end.x,
  y: (1 - t) ** 2 * start.y + 2 * (1 - t) * t * control.y + t ** 2 * end.y,
})

/**
 * bubble 本体から bot 方向へ伸びるコネクタの座標一式を求める
 *
 * - bubble 本体直下(呼び出し元が置く SVG のローカル座標原点)を起点に、bot
 *   方向(`offset` の逆ベクトル)へ弧を描く。呼び出し元が `offset`(表示位置)を
 *   変えても、この計算により自動的に bot の方向を向く
 *
 * @param offset bot 基準点(0, 0)から見た bubble 本体の相対位置(px)
 */
export const computeConnectorGeometry = (offset: Point): ConnectorGeometry => {
  const angle = Math.atan2(-offset.y, -offset.x)
  const dx = Math.cos(angle)
  const dy = Math.sin(angle)
  // 進行方向に対する法線(弧の膨らみ方向)
  const nx = dy
  const ny = -dx

  const start: Point = { x: 0, y: 0 }
  const end: Point = { x: dx * REACH_PX, y: dy * REACH_PX }
  const control: Point = {
    x: (start.x + end.x) / 2 + nx * CURVE_PX,
    y: (start.y + end.y) / 2 + ny * CURVE_PX,
  }

  const nearT = DOT_TS[0]
  const farT = DOT_TS[DOT_TS.length - 1]
  const dots = DOT_TS.map((t) => {
    // t=nearT(本体側)で 0、t=farT(bot側)で 1 になるよう正規化
    const distanceRatio = (t - nearT) / (farT - nearT)
    const r =
      DOT_RADIUS_NEAR_PX +
      (DOT_RADIUS_FAR_PX - DOT_RADIUS_NEAR_PX) * distanceRatio

    return { ...bezierPoint(start, control, end, t), r }
  })

  const tip: Point = { x: dx * TRIANGLE_REACH_PX, y: dy * TRIANGLE_REACH_PX }
  const base: Point = {
    x: tip.x - dx * TRIANGLE_LENGTH_PX,
    y: tip.y - dy * TRIANGLE_LENGTH_PX,
  }
  const base1: Point = {
    x: base.x + nx * (TRIANGLE_WIDTH_PX / 2),
    y: base.y + ny * (TRIANGLE_WIDTH_PX / 2),
  }
  const base2: Point = {
    x: base.x - nx * (TRIANGLE_WIDTH_PX / 2),
    y: base.y - ny * (TRIANGLE_WIDTH_PX / 2),
  }

  const trianglePoints = [tip, base1, base2]
    .map((point) => `${point.x},${point.y}`)
    .join(' ')

  return { dots, trianglePoints }
}
