import { keyframes, style } from '@vanilla-extract/css'

/**
 * リングが縮小 → 非表示 → 初期表示(元の大きさ)を繰り返すアニメーション
 *
 * - `0%`→`54%` で縮小して消え、`82%` まで非表示を保ち、`82%` で元の大きさへ
 *   瞬時に戻る(`step-end` で `54%`→`82%` 間は補間しない)
 * - 周期 1.4s で、縮小 約 0.75s・非表示 約 0.4s・元の大きさ 約 0.25s
 * - `scale` プロパティを動かす。位置合わせは `ring` の `translate` プロパティで
 *   行い、見た目の中心へ向かって縮小させる（`transform: translate(...)` で
 *   位置合わせすると、`scale` がその前に適用される順序のため縮小の基準点が
 *   見た目の中心からずれる）
 */
const shrinkLoop = keyframes({
  '0%': { animationTimingFunction: 'ease-in', scale: 1 },
  '54%': { animationTimingFunction: 'step-end', scale: 0 },
  '82%, 100%': { scale: 1 },
})

/** 目標セルのリング */
export const ring = style({
  animation: `${shrinkLoop} 1.4s infinite`,
  border: '3px solid #0284c7',
  borderRadius: '50%',
  pointerEvents: 'none',
  position: 'absolute',
  translate: '-50% -50%',
})
