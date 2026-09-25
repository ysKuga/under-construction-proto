import { keyframes, style } from '@vanilla-extract/css'

/** 縮小にかける秒数 */
const SHRINK_S = 0.75
/** 縮小後、非表示を保つ秒数 */
const HIDDEN_S = 0.4
/** 元の大きさで表示を保つ秒数 */
const HOLD_S = 0.12
/** 1 周期の秒数 */
const TOTAL_S = SHRINK_S + HIDDEN_S + HOLD_S

/** 周期の先頭からの秒数を keyframes の割合へ変換する */
const toPercent = (seconds: number) =>
  `${Math.round((seconds / TOTAL_S) * 10000) / 100}%`

/**
 * リングが縮小 → 非表示 → 初期表示(元の大きさ)を繰り返すアニメーション
 *
 * - 各段階の長さは `SHRINK_S`/`HIDDEN_S`/`HOLD_S` で秒数指定し、割合は
 *   そこから計算する。1 つ変えても他の段階の秒数は変わらない
 * - 非表示の後は元の大きさへ瞬時に戻る(`step-end` で非表示の間は補間しない)
 * - `scale` プロパティを動かす。位置合わせは `ring` の `translate` プロパティで
 *   行い、見た目の中心へ向かって縮小させる（`transform: translate(...)` で
 *   位置合わせすると、`scale` がその前に適用される順序のため縮小の基準点が
 *   見た目の中心からずれる）
 */
const shrinkLoop = keyframes({
  [`${toPercent(SHRINK_S + HIDDEN_S)}, 100%`]: { scale: 1 },
  '0%': { animationTimingFunction: 'ease-in', scale: 1 },
  [toPercent(SHRINK_S)]: { animationTimingFunction: 'step-end', scale: 0 },
})

/** 目標セルのリング */
export const ring = style({
  animation: `${shrinkLoop} ${TOTAL_S}s infinite`,
  border: '3px solid #0284c7',
  borderRadius: '50%',
  pointerEvents: 'none',
  position: 'absolute',
  translate: '-50% -50%',
})
