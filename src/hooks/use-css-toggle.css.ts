import { style } from '@vanilla-extract/css'

/**
 * 表示切替の起点になる hidden checkbox
 *
 * - `toggled` の兄弟セレクターが参照する。表示切替対象の直前へ置く
 */
export const checkbox = style({
  display: 'none',
})

/**
 * checkbox の checked に応じた表示状態の差分
 *
 * - off: 非表示(透明・pointer 無効・下方向へオフセット)
 * - on(`checkbox:checked` の直後の兄弟): 表示
 * - 遷移の時間・イージングは含めない。消費側で `transition` を足す
 */
export const toggled = style({
  opacity: 0,
  pointerEvents: 'none',
  selectors: {
    [`${checkbox}:checked ~ &`]: {
      opacity: 1,
      pointerEvents: 'auto',
      transform: 'translateY(0)',
    },
  },
  transform: 'translateY(0.75rem)',
})
