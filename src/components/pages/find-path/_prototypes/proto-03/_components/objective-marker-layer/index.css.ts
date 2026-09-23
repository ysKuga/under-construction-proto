import { keyframes, style } from '@vanilla-extract/css'

/**
 * リングが縮小 → 非表示 → 初期表示(元の大きさ)を繰り返すアニメーション
 *
 * - `0%`→`60%` で縮小して消え、`85%` まで非表示を保ち、`85%` で元の大きさへ
 *   瞬時に戻る(`step-end` で `60%`→`85%` 間は補間しない)
 * - 位置合わせの `transform: translate(-50%, -50%)`(`index.tsx` のインライン
 *   style)と干渉しないよう、`transform` でなく `scale` プロパティを動かす
 */
const shrinkLoop = keyframes({
  '0%': { animationTimingFunction: 'ease-in', scale: 1 },
  '60%': { animationTimingFunction: 'step-end', scale: 0 },
  '85%, 100%': { scale: 1 },
})

/** 目標セルのリング */
export const ring = style({
  animation: `${shrinkLoop} 1.6s infinite`,
  border: '3px solid #0284c7',
  borderRadius: '50%',
  pointerEvents: 'none',
  position: 'absolute',
})
