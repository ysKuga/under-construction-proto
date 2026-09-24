'use client'

import {
  ForwardedRef,
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react'

import { useCssToggle } from '@/hooks/use-css-toggle'

import { computeConnectorGeometry } from './_lib/compute-connector-geometry'
import * as styles from './index.css'

/**
 * bot 方向コネクタ(丸の弧・三角形のしっぽ)を描画する SVG の一辺(px)
 *
 * - `viewBox` の原点(0, 0)を中心に配置し、`_lib/compute-connector-geometry`
 *   が返す座標(コネクタ長 26px 前後)を描画するのに十分な余白を持たせる
 */
const CONNECTOR_SVG_SIZE_PX = 80

/**
 * `BotBubble` が呼び出し元へ公開する imperative API
 *
 * - `speech`(発言吹き出しへ切替えるか)を props でなく ref 経由の命令で
 *   伝える。呼び出し元 state の変化のたびこのコンポーネントへ新しい props を
 *   流し込まずに済み（ref は参照として安定、`memo` の props 比較に関与しない）、
 *   React state 由来の再レンダリングを増やさない
 */
export type BotBubbleHandle = {
  /** 思考吹き出し(丸のコネクタ)⇔発言吹き出し(三角形のコネクタ + 発言の文言)を切替える */
  setSpeech: (next: boolean) => void
  /** 周期的に半透明にするか。hover 中は不透明になる */
  setTranslucent: (next: boolean) => void
}

type BotBubbleProps = {
  /** 本体(button)の `aria-label` */
  ariaLabel: string
  /**
   * bot 基準点(0, 0)から見た表示位置(px)
   *
   * - 自身では bot の実座標を持たないが、コネクタ(丸の弧・三角形のしっぽ)は
   *   この値の逆ベクトルを bot 方向とみなして描画する
   *   （`_lib/compute-connector-geometry.ts`）。呼び出し元が `offset` を
   *   変えて表示位置を動かしても、コネクタは自動的に bot の方を向く
   * - `placement: 'left'` の場合は本体の右端をこの位置へ合わせる
   */
  offset: { x: number; y: number }
  /** クリック時 */
  onClick: () => void
  /**
   * bot に対して本体を置く側(既定 `'right'`)
   *
   * - `'left'` は `'right'` の左右反転。本体の右端を `offset` へ合わせ、
   *   コネクタも左右反転して bot の方を向ける
   */
  placement?: 'left' | 'right'
  /**
   * 発言吹き出し時、hover 中の文言(既定 `speechText`)
   *
   * - 発言中のクリックが別の意味(選択モード解除等)を持つ場合に、押すと
   *   どうなるかを示すために使う
   */
  speechHoverText?: string
  /** 発言吹き出し時の文言 */
  speechText: string
  /** 思考吹き出し時の文言 */
  thoughtText: string
  /** 表示するか */
  visible: boolean
}

/**
 * bot から伸びる吹き出し(思考吹き出し⇔発言吹き出し)
 *
 * - `WaypointBubble`/`ExecuteBubble` の共通実装（issue #226）
 * - 表示/非表示は `useCssToggle`（`src/hooks/use-css-toggle`）で自己管理する。
 *   `visible` prop の変化を hidden checkbox の checked へ同期するだけで、
 *   React state による条件付きレンダリング（マウント/アンマウント）は行わない。
 *   常時マウントしたまま CSS で表示切替するため、`visible` の変化元が
 *   再レンダリングされてもこのコンポーネント自身は `React.memo` によりスキップされる
 * - `speech`（発言吹き出しへ切替えるか）も同じ仕組みをもう1系統持ち、
 *   `ref`（`BotBubbleHandle.setSpeech`）経由の imperative な命令で hidden
 *   checkbox を直書きする。未選択時は「思考中」を表す丸のコネクタ + `thoughtText`、
 *   選択時は bot に向いた三角形のしっぽ + `speechText` へ切替わる。
 *   本体 hover 中も同じ見た目にする（CSS のみで切替）。発言中の hover 時は
 *   文言のみ `speechHoverText` へ切替わる
 * - 半透明化（`BotBubbleHandle.setTranslucent`）も同じ仕組み。背後の経路を
 *   隠さないために使う（issue #226）。濃淡を周期的に繰り返し、
 *   hover 中は不透明になる（CSS のみで切替）
 * - 本体(button)は `offset` に応じた位置へ固定表示しつつ常時ふわふわ揺れる。
 *   bot 方向コネクタは `offset` から逆算するため、呼び出し元が `offset` を
 *   変えても自動的に bot とのつながりを保つ（座標計算自体は
 *   `_lib/compute-connector-geometry.ts` へ分離）
 * - 呼び出し元が `useActorsStore` の `overlayContainers` が公開するコンテナへ
 *   `createPortal` で注入し（複数の吹き出しを同時注入することも想定）、
 *   `offset` で相対位置（bot 頭上等）を指定する想定（issue #137）。コンテナは
 *   floor の 3D 空間外で bot の画面上の位置へ追従するため、この吹き出し自身は
 *   tilt を意識しなくてよい
 */
export const BotBubble = memo(
  forwardRef((props: BotBubbleProps, ref: ForwardedRef<BotBubbleHandle>) => {
    const {
      ariaLabel,
      offset,
      onClick,
      placement = 'right',
      speechText,
      speechHoverText = speechText,
      thoughtText,
      visible,
    } = props

    const { checkbox, set: setVisible, toggledClassName } = useCssToggle()
    const speechCheckboxRef = useRef<HTMLInputElement>(null)
    const translucentCheckboxRef = useRef<HTMLInputElement>(null)
    const rippleRef = useRef<HTMLSpanElement>(null)

    useEffect(() => {
      setVisible(visible)
    }, [setVisible, visible])

    const setSpeech = useCallback((next: boolean) => {
      if (speechCheckboxRef.current) {
        speechCheckboxRef.current.checked = next
      }
    }, [])

    const setTranslucent = useCallback((next: boolean) => {
      if (translucentCheckboxRef.current) {
        translucentCheckboxRef.current.checked = next
      }
    }, [])

    useImperativeHandle(ref, () => ({ setSpeech, setTranslucent }), [
      setSpeech,
      setTranslucent,
    ])

    /** クリック時。波紋アニメーションを最初から再生し直してから onClick を呼ぶ */
    const handleClick = useCallback(() => {
      const rippleEl = rippleRef.current

      if (rippleEl) {
        rippleEl.style.animation = 'none'
        // reflow を挟むことで CSS アニメーションを最初から再生させる
        void rippleEl.offsetHeight
        rippleEl.style.animation = `${styles.rippleSpread} 0.5s ease-out`
      }

      onClick()
    }, [onClick])

    const isLeft = placement === 'left'
    const { dots, trianglePoints } = computeConnectorGeometry(offset)
    /** 左配置時、右配置用に求めたコネクタを左右反転する SVG transform */
    const connectorTransform = isLeft ? 'scale(-1, 1)' : undefined

    return (
      <div
        style={{
          left: offset.x,
          pointerEvents: 'none',
          position: 'absolute',
          top: offset.y,
          transform: isLeft ? 'translateX(-100%)' : undefined,
          transformStyle: 'preserve-3d',
        }}
      >
        {checkbox}
        <input
          aria-hidden
          className={styles.translucentCheckbox}
          defaultChecked={false}
          readOnly
          ref={translucentCheckboxRef}
          tabIndex={-1}
          type="checkbox"
        />
        <div
          className={`${toggledClassName} ${styles.content}`}
          style={{ position: 'relative' }}
        >
          <input
            aria-hidden
            className={styles.speechCheckbox}
            defaultChecked={false}
            readOnly
            ref={speechCheckboxRef}
            tabIndex={-1}
            type="checkbox"
          />
          <button
            aria-label={ariaLabel}
            className={styles.bubbleButton}
            onClick={handleClick}
            type="button"
          >
            <span className={styles.thoughtText}>{thoughtText}</span>
            <span className={styles.speechText}>{speechText}</span>
            <span className={styles.speechHoverText}>{speechHoverText}</span>
            <span className={styles.ripple} ref={rippleRef} />
          </button>
          <svg
            className={styles.connectorSvg}
            height={CONNECTOR_SVG_SIZE_PX}
            style={{
              left: `calc(50% - ${CONNECTOR_SVG_SIZE_PX / 2}px)`,
              position: 'absolute',
              top: `calc(100% - ${CONNECTOR_SVG_SIZE_PX / 2}px)`,
            }}
            viewBox={`${-CONNECTOR_SVG_SIZE_PX / 2} ${-CONNECTOR_SVG_SIZE_PX / 2} ${CONNECTOR_SVG_SIZE_PX} ${CONNECTOR_SVG_SIZE_PX}`}
            width={CONNECTOR_SVG_SIZE_PX}
          >
            <g transform={connectorTransform}>
              {dots.map((dot, index) => (
                <circle
                  className={styles.connectorDot}
                  cx={dot.x}
                  cy={dot.y}
                  key={index}
                  r={dot.r}
                  style={{ animationDelay: `${index * 150}ms` }}
                />
              ))}
              <polygon
                className={styles.connectorTail}
                points={trianglePoints}
              />
            </g>
          </svg>
        </div>
      </div>
    )
  }),
)

BotBubble.displayName = 'BotBubble'
