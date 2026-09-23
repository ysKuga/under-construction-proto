import { keyframes, style } from '@vanilla-extract/css'

/**
 * リングが縮小 → 非表示 → 初期表示(元の大きさ)を繰り返すアニメーション
 *
 * - `0%`→`60%` で縮小して消え、`85%` まで非表示を保ち、`85%` で元の大きさへ
 *   瞬時に戻る(`step-end` で `60%`→`85%` 間は補間しない)
 * - `scale` プロパティを動かす。位置合わせは `ring` の `translate` プロパティで
 *   行い、見た目の中心へ向かって縮小させる（`transform: translate(...)` で
 *   位置合わせすると、`scale` がその前に適用される順序のため縮小の基準点が
 *   見た目の中心からずれる）
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
  translate: '-50% -50%',
})
