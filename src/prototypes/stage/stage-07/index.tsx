'use client'

import {
  ComponentProps,
  CSSProperties,
  PropsWithChildren,
  useRef,
  useState,
} from 'react'

import {
  faceAction,
  screenAngleToYaw,
  useBoxBotActionDispatcher,
  walkingAction,
} from '@/components/theater/figure/box-bot'

import { usePerspectiveControl } from '../stage-05/_hooks/use-perspective-control'

import { ActorsLayer } from './_components/actors-layer'
import { GeoLayer } from './_components/geo-layer'
import { useHexMove } from './_hooks/use-hex-move'
import { HexCell } from './_lib/hex'

type Stage07Props = PropsWithChildren<{
  /** actor (box-bot-01) の一辺 px。マスサイズとは独立 */
  botSize: number
  /** 列数 */
  cols: number
  /** 六角形の外接円半径 (px) */
  hexSize: number
  /** 初期の現在地セル（省略時は axial 原点 (0, 0)） */
  initialCell?: HexCell
  /** rotateX の初期角度 (deg)（省略時は 0） */
  initialTiltDeg?: number
  /** 現在地セル変更時（省略可） */
  onCellChange?: (cell: HexCell) => void
  /** perspective 視点距離 (px)。小さいほど遠近が強い（省略時は 800） */
  perspectivePx?: number
  /**
   * `GeoLayer` の hex タイルの DOM を visibility registry 等へ登録する
   *
   * - 省略時は登録しない（常時表示）。渡した場合、hex タイル自体の表示/非表示が
   *   呼び出し元の可視判定に従って切り替わる（find-path proto-03 で使用）
   */
  registerCellVisibilityNode?: ComponentProps<
    typeof GeoLayer
  >['registerVisibilityNode']
  /** 行数 */
  rows: number
}>

/**
 * 舞台 (stage) — hex グリッド試作版
 *
 * - CSS Grid を使わず、矩形(col, row)を axial 座標へ変換した flat-top 六角形を
 *   absolute 配置する（issue #162）
 * - 遠近表現（perspective + rotateX の台形床）は stage-05/06 と同一。傾きは
 *   `usePerspectiveControl`（stage-05 から import）が `--floor-tilt` を ref 直書き
 * - box-bot-01 (`ActorsLayer`) をクリック移動中の現在地セルへ表示する。
 *   time-control 統合、複数 actor 対応は対象外（別途検討）
 * - セル移動のたび `useHexMove` が算出した進行方向の画面角度を `screenAngleToYaw`
 *   （box-bot-01 のカメラモデルに基づく数値逆算）で yaw へ変換し、bot と共有する
 *   `eventTarget` 経由で `face` action へ dispatch。bot を進行方向へ向かせる
 * - 移動開始で `walking` action を on、`ActorsLayer` の位置決め div の CSS transition
 *   完了（次の移動が来ないまま静止）で off にする（`walking` はトグル方式のため
 *   `isWalkingRef` で on/off 状態を追跡する）。連続移動中は on を維持し続ける
 * - `registerCellVisibilityNode` を渡すと hex タイルの表示/非表示を呼び出し元
 *   （visibility registry）に委ねられる（find-path proto-03 で使用）
 * - `children` は floor 内・`ActorsLayer` の後に重ねる（find-path proto-03 の
 *   ゴールマーカー等、overlay 用途。stage-06 と同一パターン）
 */
export const Stage07 = (props: Stage07Props) => {
  const {
    botSize,
    children,
    cols,
    hexSize,
    initialCell = { q: 0, r: 0 },
    initialTiltDeg = 0,
    onCellChange,
    perspectivePx = 800,
    registerCellVisibilityNode,
    rows,
  } = props

  /**
   * player bot(box-bot-01)と共有する EventTarget
   *
   * - lazy initializer で 1 度だけ生成する（`BoxBotEventProvider` と同じ手法）。
   *   `face` action(進行方向転換)を外部から発火するために `ActorsLayer` へ渡す
   */
  const [eventTarget] = useState<EventTarget>(() => new EventTarget())
  const { face, walking } = useBoxBotActionDispatcher(eventTarget, [
    faceAction,
    walkingAction,
  ])

  /** 歩行 action の on/off 状態(トグル方式のため呼び出し側で追跡する) */
  const isWalkingRef = useRef(false)

  const { currentCell, handleCellClick } = useHexMove(
    initialCell,
    (cell) => {
      if (!isWalkingRef.current) {
        isWalkingRef.current = true
        void walking()
      }

      onCellChange?.(cell)
    },
    (screenAngle) => {
      void face({ rad: screenAngleToYaw(screenAngle) })
    },
  )
  const { floorRef, setTilt } = usePerspectiveControl()

  /** セル間移動アニメーション完了。次の移動が来ないまま止まったら歩行を off にする */
  const handleArrived = () => {
    if (!isWalkingRef.current) return

    isWalkingRef.current = false
    void walking()
  }

  /** 透視の視点距離を持つ外枠のスタイル（floor と同じくコンテンツ幅にフィットさせ、消失点を floor 中心付近に保つ） */
  const sceneStyle: CSSProperties = {
    display: 'inline-block',
    perspective: `${perspectivePx}px`,
    perspectiveOrigin: 'center 30%',
  }

  /** rotateX で寝かせた床本体のスタイル（傾きは --floor-tilt 経由） */
  const floorStyle = {
    '--floor-tilt': `${initialTiltDeg}deg`,
    // GeoLayer のコンテンツ幅にフィットさせ、rotateX の軸をセル群の中心下端に合わせる
    display: 'inline-block',
    transform: 'rotateX(var(--floor-tilt))',
    transformOrigin: 'center bottom',
    transformStyle: 'preserve-3d',
    transition: 'transform 150ms',
  } as CSSProperties

  return (
    <div>
      <div style={sceneStyle}>
        <div ref={floorRef} style={floorStyle}>
          <GeoLayer
            cols={cols}
            currentCell={currentCell}
            hexSize={hexSize}
            onCellClick={handleCellClick}
            registerVisibilityNode={registerCellVisibilityNode}
            rows={rows}
          />
          <ActorsLayer
            cols={cols}
            currentCell={currentCell}
            eventTarget={eventTarget}
            hexSize={hexSize}
            onArrived={handleArrived}
            rows={rows}
            size={botSize}
          />
          {children}
        </div>
      </div>
      <label>
        tilt{' '}
        <input
          defaultValue={initialTiltDeg}
          max={85}
          min={0}
          onChange={(event) => {
            setTilt(Number(event.target.value))
          }}
          step={1}
          type="range"
        />
      </label>
    </div>
  )
}
