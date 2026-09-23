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

import { useGradientHoverStop } from './_hooks/use-gradient-hover-stop'
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
 * bot 基準点(0, 0)から見た推奨表示位置(px)
 *
 * - `Stage07` の `ActorOverlayLayer` が用意するコンテナ原点
 *   (bot の位置決め div の画面上の左上)からの相対位置。呼び出し元がそのまま使うことを想定
 *   するが、`offset` prop 自体は任意の値を受け付ける
 */
export const WAYPOINT_BUBBLE_OFFSET = { x: 24, y: -36 }

/**
 * `WaypointBubble` が呼び出し元へ公開する imperative API
 *
 * - `selectable`(中継点選択モードが選択可能な状態か)を props でなく ref 経由の
 *   命令で伝える。呼び出し元 state の変化のたびこのコンポーネントへ新しい
 *   props を流し込まずに済み（ref は参照として安定、`memo` の props 比較に
 *   関与しない）、React state 由来の再レンダリングを増やさない
 */
export type WaypointBubbleHandle = {
  /** 思考吹き出し(丸のコネクタ)⇔発言吹き出し(三角形のコネクタ + 文言)を切替える */
  setSelectable: (next: boolean) => void
}

type WaypointBubbleProps = {
  /**
   * bot 基準点(0, 0)から見た表示位置(px)
   *
   * - 自身では bot の実座標を持たないが、コネクタ(丸の弧・三角形のしっぽ)は
   *   この値の逆ベクトルを bot 方向とみなして描画する
   *   （`_lib/compute-connector-geometry.ts`）。呼び出し元が `offset` を
   *   変えて表示位置を動かしても、コネクタは自動的に bot の方を向く
   */
  offset: { x: number; y: number }
  /**
   * クリック時。中継点選択モードへ移行する
   */
  onClick: () => void
  /** 表示するか（`waypointFlowState === 'proposing'`） */
  visible: boolean
}

/**
 * 中継点選択モードへの導線となる吹き出し
 *
 * - 表示/非表示は `useCssToggle`（`src/hooks/use-css-toggle`）で自己管理する。
 *   `visible` prop の変化を hidden checkbox の checked へ同期するだけで、
 *   React state による条件付きレンダリング（マウント/アンマウント）は行わない。
 *   常時マウントしたまま CSS で表示切替するため、`visible` の変化元
 *   （`index.tsx` の `waypointFlowState`）が再レンダリングされてもこの
 *   コンポーネント自身は `React.memo` によりスキップされる
 * - `selectable`（中継点選択モードが選択可能な状態か）も同じ仕組みをもう1系統
 *   持ち、`ref`（`WaypointBubbleHandle.setSelectable`）経由の imperative な
 *   命令で hidden checkbox を直書きする。未選択時は「思考中」を表す丸の
 *   コネクタ、選択時は bot に向いた三角形のしっぽ + 文言「中継点！」へ切替わる
 * - 本体(button)は `offset` に応じた位置へ固定表示しつつ常時ふわふわ揺れる。
 *   bot 方向コネクタは `offset` から逆算するため、呼び出し元が `offset` を
 *   変えても自動的に bot とのつながりを保つ（座標計算自体は
 *   `_lib/compute-connector-geometry.ts` へ分離）
 * - 呼び出し元が `useActorsStore` の `overlayContainers` が公開するコンテナへ
 *   `createPortal` で注入し（複数の吹き出しを同時注入することも想定）、
 *   `offset`（既定は `WAYPOINT_BUBBLE_OFFSET`）で相対位置（bot 頭上等）を
 *   指定する想定（issue #137）。コンテナは floor の 3D 空間外で bot の画面上の
 *   位置へ追従するため、この吹き出し自身は tilt を意識しなくてよい
 */
export const WaypointBubble = memo(
  forwardRef(
    (props: WaypointBubbleProps, ref: ForwardedRef<WaypointBubbleHandle>) => {
      const { offset, onClick, visible } = props

      const { checkbox, set: setVisible, toggledClassName } = useCssToggle()
      const selectableCheckboxRef = useRef<HTMLInputElement>(null)
      const rippleRef = useRef<HTMLSpanElement>(null)
      const {
        handleAnimationIteration,
        handlePointerEnter,
        handlePointerLeave,
      } = useGradientHoverStop()

      useEffect(() => {
        setVisible(visible)
      }, [setVisible, visible])

      const setSelectable = useCallback((next: boolean) => {
        if (selectableCheckboxRef.current) {
          selectableCheckboxRef.current.checked = next
        }
      }, [])

      useImperativeHandle(ref, () => ({ setSelectable }), [setSelectable])

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

      const { dots, trianglePoints } = computeConnectorGeometry(offset)

      return (
        <div
          style={{
            left: offset.x,
            pointerEvents: 'none',
            position: 'absolute',
            top: offset.y,
            transformStyle: 'preserve-3d',
          }}
        >
          {checkbox}
          <div className={toggledClassName} style={{ position: 'relative' }}>
            <input
              aria-hidden
              className={styles.selectableCheckbox}
              defaultChecked={false}
              readOnly
              ref={selectableCheckboxRef}
              tabIndex={-1}
              type="checkbox"
            />
            <button
              aria-label="中継点選択モードへ移行"
              className={styles.bubbleButton}
              onAnimationIteration={handleAnimationIteration}
              onClick={handleClick}
              onPointerEnter={handlePointerEnter}
              onPointerLeave={handlePointerLeave}
              type="button"
            >
              <span className={styles.thoughtText}>中継点？</span>
              <span className={styles.speechText}>中継点！</span>
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
            </svg>
          </div>
        </div>
      )
    },
  ),
)

WaypointBubble.displayName = 'WaypointBubble'
