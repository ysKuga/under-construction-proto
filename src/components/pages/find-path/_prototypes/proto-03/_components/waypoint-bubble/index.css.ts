import { keyframes, style } from '@vanilla-extract/css'

/**
 * 中継点選択モードが選択可能な状態(`selectable`)を伝える hidden checkbox
 *
 * - `useCssToggle`(`visible` 用)の hidden checkbox は全インスタンス共通クラス
 *   のため他 `.css.ts` から参照できず（`use-css-toggle.stories.tsx` の
 *   `SharedScope` 参照）、`selectable` 用はこのコンポーネント専用クラスを
 *   自前で用意し `index.tsx` から直接付与する
 */
export const selectableCheckbox = style({
  display: 'none',
})

/** 本体(button)がふわふわ揺れるアニメーション(上下 + 微小回転) */
const float = keyframes({
  '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
  '50%': { transform: 'translateY(-3px) rotate(-1.5deg)' },
})

/**
 * 吹き出し本体(button)
 *
 * - 文言の出し分けセレクター基点も兼ねる
 * - 回転の中心を下端(bot・コネクタ側)にし、ふわふわ揺れてもコネクタとの
 *   接続点が安定して見えるようにする
 * - 枠線は既定で dotted、hover 時のみ solid にする
 * - `selectable` 選択時はふわふわ揺れを止め、枠線も常時 solid にする
 *   (発言中は静止させ、思考中(未選択時)と見た目で区別する)
 */
export const bubbleButton = style({
  ':hover': {
    borderStyle: 'solid',
  },
  animation: `${float} 2.4s ease-in-out infinite`,
  background: '#fff',
  border: '2px dotted #9ca3af',
  borderRadius: 8,
  cursor: 'pointer',
  fontSize: 12,
  padding: '2px 6px',
  selectors: {
    [`${selectableCheckbox}:checked ~ &`]: {
      animation: 'none',
      borderStyle: 'solid',
    },
  },
  transformOrigin: 'bottom center',
  whiteSpace: 'nowrap',
})

/** 文言「中継？」(`selectable` 未選択時のみ表示) */
export const thoughtText = style({
  selectors: {
    [`${selectableCheckbox}:checked ~ ${bubbleButton} &`]: {
      display: 'none',
    },
  },
})

/** 文言「中継点！」(`selectable` 選択時のみ表示) */
export const speechText = style({
  display: 'none',
  selectors: {
    [`${selectableCheckbox}:checked ~ ${bubbleButton} &`]: {
      display: 'inline',
    },
  },
})

/**
 * bot 方向コネクタ(丸の弧・三角形のしっぽ)を描画する SVG
 *
 * - 丸/三角形の表示切替セレクター基点を兼ねる（`selectableCheckbox` と
 *   SVG 内の子要素は DOM 上別の親のため、直接の兄弟セレクターが使えず
 *   この class を経由する。`bubbleButton`/`thoughtText` と同型）
 */
export const connectorSvg = style({
  overflow: 'visible',
  pointerEvents: 'none',
})

/** 丸がふわふわ揺れるアニメーション(上下) */
const dotFloat = keyframes({
  '0%, 100%': { transform: 'translateY(0)' },
  '50%': { transform: 'translateY(-2px)' },
})

/**
 * 丸1個(bot と吹き出し本体をつなぐ弧上に配置。`selectable` 未選択時のみ表示)
 *
 * - `transformBox: 'fill-box'` で丸自身の中心を回転/移動の基準にする
 *   (指定しないと SVG viewport 原点基準になり、丸ごとに動きがズレる)
 */
export const connectorDot = style({
  animation: `${dotFloat} 1.2s ease-in-out infinite`,
  fill: '#9ca3af',
  selectors: {
    [`${selectableCheckbox}:checked ~ ${connectorSvg} &`]: {
      display: 'none',
    },
  },
  transformBox: 'fill-box',
  transformOrigin: 'center',
})

/** bot に向いた三角形のしっぽ(`selectable` 選択時のみ表示) */
export const connectorTail = style({
  display: 'none',
  fill: '#9ca3af',
  selectors: {
    [`${selectableCheckbox}:checked ~ ${connectorSvg} &`]: {
      display: 'block',
    },
  },
})
