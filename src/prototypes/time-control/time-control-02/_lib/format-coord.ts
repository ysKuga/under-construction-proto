/**
 * 座標値を画面表示用に丸める
 *
 * @param value 丸め対象の座標値
 */
export const formatCoord = (value: number): number =>
  Math.round(value * 1000) / 1000
