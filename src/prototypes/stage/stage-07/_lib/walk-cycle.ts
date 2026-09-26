/**
 * 移動時間から walking の脚振り周期(`cycleSec`)を算出する
 *
 * - walking の 1 周期(両脚 1 往復 = 2 歩)を、1 マス移動(片脚 1 歩)の 2 マスぶんとみなす\
 *   線形式(移動時間の 2 倍、`maxWalkCycleSec` で頭打ち)を基準に、上限未満の区間を\
 *   `cadenceExponent` 乗で縮める
 * - `cadenceExponent` = 1 で線形式と一致する(1 マスあたり常に 1 歩)
 * - `cadenceExponent` > 1 で、移動時間が短い(速い)ほど 1 マスあたり歩数が増える\
 *   (1 マスあたり歩数 ∝ `moveDurationMs ^ (1 - cadenceExponent)`)。線形式のままだと\
 *   速い移動ほど振りの回数が速度に見合わず不自然に見えるため
 *
 * @param moveDurationMs セル間移動アニメーションの所要時間(ms)
 * @param maxWalkCycleSec 周期の上限(秒)
 * @param cadenceExponent 上限未満の区間で周期を縮める指数
 */
export const computeWalkCycleSec = (
  moveDurationMs: number,
  maxWalkCycleSec: number,
  cadenceExponent: number,
): number => {
  /** 線形式が上限に達する移動時間(ms) */
  const capMs = (maxWalkCycleSec * 1000) / 2

  return (
    maxWalkCycleSec * Math.min(1, moveDurationMs / capMs) ** cadenceExponent
  )
}
