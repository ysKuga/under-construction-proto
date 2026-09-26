import {
  CSSProperties,
  memo,
  TransitionEvent,
  useCallback,
  useRef,
} from 'react'

import {
  bodyBobbingAction,
  BoxBot01,
  energyOutAction,
  faceAction,
  walkingAction,
  walkingResetAction,
} from '@/components/theater/figure/box-bot'

import { PLAYER_ACTOR_ID } from '../../../stage-06/constants'
import { useEffectCellReach } from '../../_hooks/use-effect-cell-reach'
import { HexCell } from '../../_lib/hex'
import { computeHexGridBounds, hexCellCenter } from '../../_lib/hex-layout'
import { useActorsStore } from '../../_stores/actors'

type ActorsLayerProps = {
  /** 列数 */
  cols: number
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
 * - `useActorsStore`(zustand store)を直接 selector 購読し、`actors` map の変化(player
 *   移動・mob の spawn/despawn)のたびこのコンポーネントのみ再レンダリングする。呼び出し元
 *   (`Stage07`)を経由しないため、mob の動的追加/削除で `Stage07` 以下全体が再レンダリング
 *   されることはない(issue #215)
 * - `PLAYER_ACTOR_ID` のセルへ walking/face 対応の bot を、それ以外の actorId には
 *   `actions=[]`・`interactive=false` の静的 bot を描画する
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
 * - player の描画位置がセル中心に到達したら `Stage07-cell-reach` を発行する
 *   （`useEffectCellReach`）
 * - visibility registry・ref registry 化は対象外（試作スコープ、issue #162）
 * - `React.memo` 化済み（issue-181-en backlog）。EN 残量等 find-path 固有の状態変化に
 *   巻き込まれず再レンダリングしないため、呼び出し元は `onArrived` 等の関数 props を
 *   安定化すること
 * - player bot の位置決め div 内にオーバーレイ追従先(アンカー) DOM を用意し、
 *   `useActorsStore` の `registerOverlayAnchor` で登録する（issue #137）。
 *   注入用コンテナ自体は floor の 3D 空間外の `ActorOverlayLayer` が持ち、
 *   このアンカーの画面上の位置へ追従させる。当初はこの位置決め div 内に
 *   コンテナを置いていたが、floor の奥行きヒットテストで `GeoLayer` のセルに
 *   クリックを奪われたため分離した
 */
/**
 * face / walking / walkingReset / bodyBobbing / energyOut を有効化する(jump/spin 等は無効のまま)
 *
 * - 配列の順 = `useFrame` の実行順。bodyBobbing は walking が書いた脚 swing を読むため walking より後
 */
const ACTIONS = [
  faceAction,
  walkingAction,
  walkingResetAction,
  bodyBobbingAction,
  energyOutAction,
]

/**
 * 腕振り角の振幅(rad)。前後 90 度ずつ(合計可動域 180 度)に固定する
 *
 * - `Math.sin(phase) * ARM_SWING_ANGLE` が rotation.x へそのまま入るため、
 *   振幅 = 中心(直立)から前後それぞれの最大角。180 度(`Math.PI`)を振幅に
 *   使うと前後 180 度ずつ(合計 360 度、1 回転)になってしまうため π/2 にする
 */
const ARM_SWING_ANGLE = Math.PI / 2

/**
 * walking の速度収束レート(`speedApproachRate`)の基準値。box-bot 既定値
 * (`WALKING_DEFAULTS.speedApproachRate`)と同じ、`cycleSec` = 1 のときの値
 *
 * - `cycleSec` に反比例させ、周期が短いほど速く収束させる(`cycleSec` 計算の隣で使用)。
 *   box-bot 既定のレートのまま stage-07 の短い `moveDurationMs`(数百 ms)で使うと、
 *   歩行の減速だけで数秒かかり「到着後も行進が続く」ように見えるため
 */
const BASE_SPEED_APPROACH_RATE = 3

/** store に `PLAYER_ACTOR_ID` が未設定(Provider 設定漏れ)なときのフォールバックセル */
const DEFAULT_CELL: HexCell = { q: 0, r: 0 }

export const ActorsLayer = memo((props: ActorsLayerProps) => {
  const {
    cols,
    eventTarget,
    hexSize,
    legSwingAngle,
    maxWalkCycleSec = 1.2,
    moveDurationMs = 150,
    onArrived,
    rows,
    size,
  } = props

  const actors = useActorsStore((state) => state.actors)
  const registerOverlayAnchor = useActorsStore(
    (state) => state.registerOverlayAnchor,
  )
  /**
   * player のアンカー DOM を登録する ref コールバック
   *
   * - 移動のたび再レンダリングされるため、参照を固定して登録解除→再登録の
   *   繰返し(store 更新の連鎖)を避ける
   */
  const registerPlayerOverlayAnchor = useCallback(
    (el: HTMLDivElement | null) => registerOverlayAnchor(PLAYER_ACTOR_ID, el),
    [registerOverlayAnchor],
  )
  const currentCell = actors[PLAYER_ACTOR_ID] ?? DEFAULT_CELL
  const mobs = Object.entries(actors).filter(
    ([actorId]) => actorId !== PLAYER_ACTOR_ID,
  )

  const bounds = computeHexGridBounds(cols, rows, hexSize)
  const center = hexCellCenter(currentCell, hexSize, bounds)

  const style: CSSProperties = {
    height: size,
    left: center.x,
    position: 'absolute',
    top: center.y,
    transform: 'translate(-50%, -53%) rotateX(calc(-1 * var(--floor-tilt)))',
    transformOrigin: 'center bottom',
    transition: `left ${moveDurationMs}ms linear, top ${moveDurationMs}ms linear, transform ${moveDurationMs}ms linear`,
    width: size,
  }

  /** player の位置決め要素(セル中心への到達判定で描画位置を読む) */
  const playerRef = useRef<HTMLDivElement>(null)

  useEffectCellReach(
    PLAYER_ACTOR_ID,
    playerRef,
    currentCell,
    cols,
    rows,
    hexSize,
    moveDurationMs,
  )

  const handleTransitionEnd = (event: TransitionEvent<HTMLDivElement>) => {
    if (event.propertyName !== 'left' && event.propertyName !== 'top') return

    onArrived?.()
  }

  /** mob(静止配置)の位置スタイル。移動しないため transition は持たない */
  const mobStyle = (cell: HexCell): CSSProperties => {
    const mobCenter = hexCellCenter(cell, hexSize, bounds)

    return {
      height: size,
      left: mobCenter.x,
      position: 'absolute',
      top: mobCenter.y,
      transform: 'translate(-50%, -53%) rotateX(calc(-1 * var(--floor-tilt)))',
      transformOrigin: 'center bottom',
      width: size,
    }
  }

  /**
   * walking の 1 周期(両脚 1 往復 = 2 歩)を、1 マス移動(片脚 1 歩)の 2 マスぶんとみなし、
   * 移動時間の 2 倍を周期にする（`maxWalkCycleSec` で頭打ち）
   */
  const cycleSec = Math.min((moveDurationMs / 1000) * 2, maxWalkCycleSec)

  /** `cycleSec` に反比例させた歩行の速度収束レート(`BASE_SPEED_APPROACH_RATE` 参照) */
  const speedApproachRate = BASE_SPEED_APPROACH_RATE / cycleSec

  return (
    <>
      <div onTransitionEnd={handleTransitionEnd} ref={playerRef} style={style}>
        <BoxBot01
          actionConfig={{
            walking: {
              armSwingAngle: ARM_SWING_ANGLE,
              cycleSec,
              speedApproachRate,
              // defineAction が {...defaults, ...override} でマージするため、
              // undefined を明示的に含めると既定値を上書きしてしまう。省略する
              ...(legSwingAngle !== undefined && { swingAngle: legSwingAngle }),
            },
            // 体の上下の正規化基準を脚振り角へ揃える（ずれると頂点で頭打ち・最大量未達になる）
            ...(legSwingAngle !== undefined && {
              bodyBobbing: { swingRef: legSwingAngle },
            }),
          }}
          actions={ACTIONS}
          eventTarget={eventTarget}
          orbit={false}
          style={{ height: size, width: size }}
        />
        <div
          ref={registerPlayerOverlayAnchor}
          style={{ inset: 0, pointerEvents: 'none', position: 'absolute' }}
        />
      </div>
      {mobs.map(([actorId, cell]) => (
        <div key={actorId} style={mobStyle(cell)}>
          <BoxBot01
            actions={[]}
            interactive={false}
            orbit={false}
            style={{ height: size, width: size }}
          />
        </div>
      ))}
    </>
  )
})

ActorsLayer.displayName = 'ActorsLayer'
