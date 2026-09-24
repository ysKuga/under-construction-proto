import { keyframes, style } from '@vanilla-extract/css'

/**
 * 発言吹き出しへ切替えるか(`speech`)を伝える hidden checkbox
 *
 * - `useCssToggle`(`visible` 用)の hidden checkbox は全インスタンス共通クラス
 *   のため他 `.css.ts` から参照できず（`use-css-toggle.stories.tsx` の
 *   `SharedScope` 参照）、`speech` 用はこのコンポーネント専用クラスを
 *   自前で用意し `index.tsx` から直接付与する
 */
export const speechCheckbox = style({
  display: 'none',
})

/**
 * 半透明にするか(`translucent`)を伝える hidden checkbox
 *
 * - `speechCheckbox` と同じ理由でこのコンポーネント専用クラスを用意する
 */
export const translucentCheckbox = style({
  display: 'none',
})

/**
 * 濃い半透明⇔薄い半透明を周期的に繰り返すアニメーション
 *
 * - 常に薄いと吹き出しの存在に気付きにくく、常に濃いと背後の経路を隠すため、
 *   両方を周期的に行き来させる。濃い側も完全な不透明にはしない
 */
const translucentPulse = keyframes({
  '0%, 100%': { opacity: 0.8 },
  '50%': { opacity: 0.2 },
})

/**
 * 本体(button)とコネクタをまとめる要素
 *
 * - `translucent` 選択時は周期的に半透明にし、背後の経路を見せる（issue #226）
 * - hover 中は不透明にし、文言を読める・押せることを示す
 * - hover 中もアニメーション自体は止めず、`!important` で opacity のみ上書きする。
 *   止めると hover 解除時に最初から再生し直され、同時に表示中の他の吹き出しと
 *   周期がずれるため（`!important` の宣言はアニメーションの値より優先される）
 */
export const content = style({
  selectors: {
    [`${translucentCheckbox}:checked ~ &:hover`]: {
      opacity: '1 !important',
    },
    [`${translucentCheckbox}:checked ~ &`]: {
      animation: `${translucentPulse} 2.4s ease-in-out infinite`,
    },
  },
})

/** 本体(button)がふわふわ揺れるアニメーション(上下 + 微小回転) */
const float = keyframes({
  '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
  '50%': { transform: 'translateY(-3px) rotate(-1.5deg)' },
})

/**
 * 背景の帯が右から左へ一方向に流れるアニメーション
 *
 * - 思考中(`speech` 未選択・非 hover 時)、bubble の存在を目立たせるために常時流し続ける
 * - 往復でなく一方向ループ(`100%` フレーム到達後、瞬時に `0%` へ戻り
 *   流れ続ける)。`linear` と組み合わせて等速に保つ
 * - 背景は繰返し(`background-repeat` 既定)のため、`background-size: 300%` だと
 *   `background-position` 150% 周期で同じ見た目になる。1 周を 1 周期ぶん
 *   (帯 1 回の通過)にし、周の境目(`125%` ≡ `-25%`)を帯が見えない位置に置く
 */
const gradientShift = keyframes({
  '0%': { backgroundPosition: '125% 50%' },
  '100%': { backgroundPosition: '-25% 50%' },
})

/**
 * 吹き出し本体(button)
 *
 * - 文言の出し分け・コネクタ(hover 時)の表示切替セレクター基点も兼ねる
 * - 回転の中心を下端(bot・コネクタ側)にし、ふわふわ揺れてもコネクタとの
 *   接続点が安定して見えるようにする
 * - `speech` 選択時・hover 中は発言吹き出しとして、ふわふわ揺れ・背景
 *   グラデーションを即時止め、枠線を dotted から solid にする(発言中は静止させ、
 *   思考中と見た目で区別する。hover 中は揺れたままだとカーソルが要素から外れ
 *   hover が安定しない)
 * - `overflow: hidden` はクリック時の `ripple`(`index.tsx` 内
 *   `<span>`)がこの角丸からはみ出さないための指定
 */
export const bubbleButton = style({
  animation: `${float} 2.4s ease-in-out infinite, ${gradientShift} 1.1s linear infinite`,
  background:
    'linear-gradient(120deg, #fff 0%, #fff 46%, rgba(156, 163, 175, 0.5) 50%, #fff 54%, #fff 100%)',
  backgroundSize: '300% 100%',
  border: '2px dotted #9ca3af',
  borderRadius: 8,
  cursor: 'pointer',
  fontSize: 12,
  overflow: 'hidden',
  padding: '2px 6px',
  position: 'relative',
  selectors: {
    [`${speechCheckbox}:checked ~ &, &:hover`]: {
      animation: 'none',
      borderStyle: 'solid',
    },
  },
  transformOrigin: 'bottom center',
  whiteSpace: 'nowrap',
})

/**
 * クリック時、中心から広がって消える波紋アニメーション
 *
 * - `ripple` クラス自体には `animation` を持たせない。`index.tsx` がクリック
 *   のたびインライン `style.animation` へこの名前を直接設定して再生する
 *   (CSS クラス側に `animation` を持たせると、reflow トリックでインライン
 *   style をリセットした際に CSS 側の値へ戻ってしまい、2 回目以降の
 *   クリックで再生されなくなる)
 */
export const rippleSpread = keyframes({
  '0%': { opacity: 0.5, transform: 'scale(0)' },
  '100%': { opacity: 0, transform: 'scale(2.5)' },
})

/**
 * クリック時の波紋(`bubbleButton` 内、`index.tsx` が ref 経由でアニメーション
 * を再生する)
 *
 * - 既定は `opacity: 0`(非表示)。`animation` を持たないため、
 *   `index.tsx` がインライン style で `rippleSpread` を設定した時だけ
 *   再生され、終了後は既定値(`opacity: 0`)へ自然に戻る
 */
export const ripple = style({
  background:
    'radial-gradient(circle, rgba(107, 114, 128, 0.85), transparent 70%)',
  borderRadius: '9999px',
  inset: 0,
  opacity: 0,
  pointerEvents: 'none',
  position: 'absolute',
})

/** 思考中の文言(`speech` 未選択時のみ表示) */
export const thoughtText = style({
  selectors: {
    [`${speechCheckbox}:checked ~ ${bubbleButton} &, ${bubbleButton}:hover &`]:
      {
        display: 'none',
      },
  },
})

/**
 * 発言の文言(`speech` 選択時・hover 中に表示)
 *
 * - `speech` 選択中の hover 時は `speechHoverText` と入替わる
 */
export const speechText = style({
  display: 'none',
  selectors: {
    [`${speechCheckbox}:checked ~ ${bubbleButton} &, ${bubbleButton}:hover &`]:
      {
        display: 'inline',
      },
    [`${speechCheckbox}:checked ~ ${bubbleButton}:hover &`]: {
      display: 'none',
    },
  },
})

/** 発言中 hover 時の文言(`speech` 選択中の hover 時のみ表示) */
export const speechHoverText = style({
  display: 'none',
  selectors: {
    [`${speechCheckbox}:checked ~ ${bubbleButton}:hover &`]: {
      display: 'inline',
    },
  },
})

/**
 * bot 方向コネクタ(丸の弧・三角形のしっぽ)を描画する SVG
 *
 * - 丸/三角形の表示切替セレクター基点を兼ねる（`speechCheckbox` と
 *   SVG 内の子要素は DOM 上別の親のため、直接の兄弟セレクターが使えず
 *   この class を経由する。`bubbleButton`/`thoughtText` と同型）
 * - hover 時の切替は、本体(button)の後ろに兄弟として置くことで
 *   `${bubbleButton}:hover ~` から辿る
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
 * 丸1個(bot と吹き出し本体をつなぐ弧上に配置。`speech` 未選択時のみ表示)
 *
 * - 白背景 + グレー枠線。吹き出し本体(button)と同じ配色にし塗りつぶしの
 *   丸より馴染ませる
 * - `transformBox: 'fill-box'` で丸自身の中心を回転/移動の基準にする
 *   (指定しないと SVG viewport 原点基準になり、丸ごとに動きがズレる)
 */
export const connectorDot = style({
  animation: `${dotFloat} 1.2s ease-in-out infinite`,
  fill: '#fff',
  selectors: {
    [`${speechCheckbox}:checked ~ ${connectorSvg} &, ${bubbleButton}:hover ~ ${connectorSvg} &`]:
      {
        display: 'none',
      },
  },
  stroke: '#9ca3af',
  strokeWidth: 1.5,
  transformBox: 'fill-box',
  transformOrigin: 'center',
})

/** bot に向いた三角形のしっぽ(`speech` 選択時のみ表示) */
export const connectorTail = style({
  display: 'none',
  fill: '#9ca3af',
  selectors: {
    [`${speechCheckbox}:checked ~ ${connectorSvg} &, ${bubbleButton}:hover ~ ${connectorSvg} &`]:
      {
        display: 'block',
      },
  },
})
