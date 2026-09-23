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
 * 背景の帯が右から左へ一方向に流れるアニメーション
 *
 * - 未選択・非 hover 時、bubble の存在を目立たせるために常時流し続ける
 * - hover 時の停止は CSS でなく `_hooks/use-gradient-hover-stop` が担う
 *   (帯を途中で止めず流しきってから止めるため)
 * - 往復でなく一方向ループ(`100%` フレーム到達後、瞬時に `0%` へ戻り
 *   流れ続ける)。`linear` と組み合わせて等速に保つ
 * - 背景は繰返し(`background-repeat` 既定)のため、`background-size: 300%` だと
 *   `background-position` 150% 周期で同じ見た目になる。1 周を 1 周期ぶん
 *   (帯 1 回の通過)にし、周の境目(`125%` ≡ `-25%`)を帯が見えない位置に置く。
 *   hover 時にこの境目で止めるため(`_hooks/use-gradient-hover-stop`)
 */
export const gradientShift = keyframes({
  '0%': { backgroundPosition: '125% 50%' },
  '100%': { backgroundPosition: '-25% 50%' },
})

/**
 * 吹き出し本体(button)
 *
 * - 文言の出し分けセレクター基点も兼ねる
 * - 回転の中心を下端(bot・コネクタ側)にし、ふわふわ揺れてもコネクタとの
 *   接続点が安定して見えるようにする
 * - 枠線は既定で dotted、hover 時のみ solid にする。hover 中はふわふわ揺れを
 *   一時停止する(揺れたままだとカーソルが要素から外れ hover が安定しない)。
 *   `animation-play-state` は `animation` の並び順に対応し、背景グラデーション
 *   (2 番目)は running のまま残す(停止は `_hooks/use-gradient-hover-stop`)
 * - `selectable` 選択時はふわふわ揺れ・背景グラデーションを止め、枠線も常時
 *   solid にする(発言中は静止させ、思考中(未選択時)と見た目で区別する)
 * - `overflow: hidden` はクリック時の `ripple`(`_components/waypoint-bubble`
 *   内 `<span>`)がこの角丸からはみ出さないための指定
 */
export const bubbleButton = style({
  ':hover': {
    animationPlayState: 'paused, running',
    borderStyle: 'solid',
  },
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
    [`${selectableCheckbox}:checked ~ &`]: {
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
 * - 白背景 + グレー枠線。吹き出し本体(button)と同じ配色にし塗りつぶしの
 *   丸より馴染ませる
 * - `transformBox: 'fill-box'` で丸自身の中心を回転/移動の基準にする
 *   (指定しないと SVG viewport 原点基準になり、丸ごとに動きがズレる)
 */
export const connectorDot = style({
  animation: `${dotFloat} 1.2s ease-in-out infinite`,
  fill: '#fff',
  selectors: {
    [`${selectableCheckbox}:checked ~ ${connectorSvg} &`]: {
      display: 'none',
    },
  },
  stroke: '#9ca3af',
  strokeWidth: 1.5,
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

/**
 * 「実行」ボタン(経路に沿った自動移動を開始する)
 *
 * - 吹き出し本体(button)の右隣へ absolute 配置する。通常フローに置くと
 *   親の幅が変わり、`50%` 基準で配置しているコネクタ SVG の位置がずれるため
 * - 吹き出し本体と同じ配色・枠線(solid)にし、並べて馴染ませる
 */
export const executeButton = style({
  ':hover': {
    backgroundColor: '#f3f4f6',
  },
  backgroundColor: '#fff',
  border: '2px solid #9ca3af',
  borderRadius: 8,
  cursor: 'pointer',
  fontSize: 12,
  left: 'calc(100% + 4px)',
  padding: '2px 6px',
  position: 'absolute',
  top: 0,
  whiteSpace: 'nowrap',
})
