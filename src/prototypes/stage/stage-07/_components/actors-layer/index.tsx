import { CSSProperties, TransitionEvent } from 'react'

import {
  BoxBot01,
  faceAction,
  walkingAction,
} from '@/components/theater/figure/box-bot'

import { HexCell } from '../../_lib/hex'
import { computeHexGridBounds, hexCellCenter } from '../../_lib/hex-layout'

type ActorsLayerProps = {
  /** 列数 */
  cols: number
  /** 現在地セル */
  currentCell: HexCell
  /**
   * player bot と共有する EventTarget
   *
   * - 省略時は box-bot-01 が instance 固有のものを内部生成する（向き変更を発火できない）
   */
  eventTarget?: EventTarget
  /** 六角形の外接円半径 (px) */
  hexSize: number
  /** walking の脚振り角の振幅(rad)（省略時は `WALKING_DEFAULTS.swingAngle` = `0.5`） */
  legSwingAngle?: number
  /**
   * walking の脚振り周期(`cycleSec`)の上限(秒)（省略時は `1.2`）
   *
   * - 歩幅(`swingAngle`)は変えず、周期の伸びだけをここで頭打ちにする
   */
  maxWalkCycleSec?: number
  /** セル間移動アニメーションの所要時間(ms)（省略時は `150`） */
  moveDurationMs?: number
  /**
   * セル間移動アニメーション(位置決め div の CSS transition)完了時(省略可)
   *
   * - `left`/`top`/`transform` の 3 プロパティで発火する。hex 座標は移動方向によって
   *   `left`/`top` の一方しか値が変化しないケースがある(例: axial の q 不変の移動は
   *   `left` が変化しない)ため、両方を完了判定の対象にする。呼び出し側は
   *   `left`/`top` それぞれの `transitionend` で二重に呼ばれても安全な実装にすること
   */
  onArrived?: () => void
  /** 行数 */
  rows: number
  /** actor (box-bot-01) の一辺 px。マスサイズとは独立 */
  size: number
}

/**
 * hex グリッド上の actor (box-bot-01) 表示
 *
 * - 現在地セル中心へ絶対配置する。座標計算は `GeoLayer` と同じ `hexCellCenter`/
 *   `computeHexGridBounds` を共有し、セルの見た目位置とズレないようにする
 * - 床の rotateX を打ち消す逆 rotateX で、傾いた床の上でも直立させる（stage-06 の
 *   `ActorsLayer` と同一手法）
 * - `walking` action の脚振り周期(`cycleSec`)を `moveDurationMs` と連動させる。
 *   移動時間だけを変えても脚の振り速度(周期)が一定だと、見た目の歩幅と移動距離の
 *   対応が崩れる（速い移動なのに脚がゆっくり／遅い移動なのに脚が速く振れる）ため
 * - `cycleSec` には `maxWalkCycleSec` の上限を設ける。線形連動のみだと極端に遅い
 *   `moveDurationMs`（3000ms 等）で周期が数秒に伸び、歩幅(`swingAngle`)は変わらない
 *   ため振れているかどうか視認しづらくなる。歩幅は変えず、周期の伸びだけ頭打ちにして
 *   常に一定以上の頻度で動きが見えるようにする
 * - visibility registry・複数 actor・ref registry 化は対象外（試作スコープ、issue #162）
 */
/** face / walking を有効化する(jump/spin 等は無効のまま) */
const ACTIONS = [faceAction, walkingAction]

/**
 * 腕振り角の振幅(rad)。前後 90 度ずつ(合計可動域 180 度)に固定する
 *
 * - `Math.sin(phase) * ARM_SWING_ANGLE` が rotation.x へそのまま入るため、
 *   振幅 = 中心(直立)から前後それぞれの最大角。180 度(`Math.PI`)を振幅に
 *   使うと前後 180 度ずつ(合計 360 度、1 回転)になってしまうため π/2 にする
 */
const ARM_SWING_ANGLE = Math.PI / 2

export const ActorsLayer = (props: ActorsLayerProps) => {
  const {
    cols,
    currentCell,
    eventTarget,
    hexSize,
    legSwingAngle,
    maxWalkCycleSec = 1.2,
    moveDurationMs = 150,
    onArrived,
    rows,
    size,
  } = props

  const bounds = computeHexGridBounds(cols, rows, hexSize)
  const center = hexCellCenter(currentCell, hexSize, bounds)

  const style: CSSProperties = {
    height: size,
    left: center.x,
    position: 'absolute',
    top: center.y,
    transform: 'translate(-50%, -53%) rotateX(calc(-1 * var(--floor-tilt)))',
    transformOrigin: 'center bottom',
    transition: `left ${moveDurationMs}ms, top ${moveDurationMs}ms, transform ${moveDurationMs}ms`,
    width: size,
  }

  const handleTransitionEnd = (event: TransitionEvent<HTMLDivElement>) => {
    if (event.propertyName !== 'left' && event.propertyName !== 'top') return

    onArrived?.()
  }

  /**
   * walking の 1 周期(両脚 1 往復 = 2 歩)を、1 マス移動(片脚 1 歩)の 2 マスぶんとみなし、
   * 移動時間の 2 倍を周期にする（`maxWalkCycleSec` で頭打ち）
   */
  const cycleSec = Math.min((moveDurationMs / 1000) * 2, maxWalkCycleSec)

  return (
    <div onTransitionEnd={handleTransitionEnd} style={style}>
      <BoxBot01
        actionConfig={{
          walking: {
            armSwingAngle: ARM_SWING_ANGLE,
            cycleSec,
            // defineAction が {...defaults, ...override} でマージするため、
            // undefined を明示的に含めると既定値を上書きしてしまう。省略する
            ...(legSwingAngle !== undefined && { swingAngle: legSwingAngle }),
          },
        }}
        actions={ACTIONS}
        eventTarget={eventTarget}
        orbit={false}
        style={{ height: size, width: size }}
      />
    </div>
  )
}
