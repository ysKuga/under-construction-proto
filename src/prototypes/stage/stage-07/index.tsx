'use client'

import {
  ComponentProps,
  CSSProperties,
  PropsWithChildren,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'

import {
  faceAction,
  screenAngleToYaw,
  useBoxBotActionDispatcher,
  walkingAction,
  walkingResetAction,
} from '@/components/theater/figure/box-bot'

import { usePerspectiveControl } from '../stage-05/_hooks/use-perspective-control'

import { ActorsLayer } from './_components/actors-layer'
import { GeoLayer } from './_components/geo-layer'
import { useActorNodeRegistry } from './_contexts/actor-node-registry'
import { useHexMove } from './_hooks/use-hex-move'
import {
  HexCell,
  hexDirectionToScreenAngle,
  pickInitialFacingTarget,
} from './_lib/hex'

type Stage07Props = PropsWithChildren<{
  /**
   * player bot と共有する EventTarget（省略可）
   *
   * - 省略時は box-bot-01 が instance 固有のものを内部生成する
   * - EN 切れ演出(`energyOutAction`、issue #181)等、呼び出し元から直接 dispatch
   *   したい action がある場合に渡す（stage-06 と同じ方式）
   */
  actorEventTarget?: EventTarget
  /** actor (box-bot-01) の一辺 px。マスサイズとは独立 */
  botSize: number
  /**
   * 対象セルへ進入可能か（省略時は常に進入可能）
   *
   * - 隣接判定に加えてこのセルへの移動を拒否できる（find-path proto-03 の
   *   障害物セル判定等）。`useHexMove` へそのまま渡す
   */
  canEnterCell?: (cell: HexCell) => boolean
  /** 列数 */
  cols: number
  /**
   * 移動中に walking action(歩行モーション)を再生するか(省略時は `false`)
   *
   * - 1 マスごとの隣接クリック移動(150ms transition)だと on → off が一瞬で
   *   切り替わり不自然に見えるため、既定は無効。tick 駆動で複数マスを連続実行する
   *   方式（find-path proto-01 の `useFindPathTick` 等）の方が相性がよい
   */
  enableWalking?: boolean
  /** 六角形の外接円半径 (px) */
  hexSize: number
  /** walking の脚振り角の初期振幅(rad)（省略時は `WALKING_DEFAULTS.swingAngle` = `0.5`） */
  initialLegSwingAngle?: number
  /**
   * walking の脚振り周期(`cycleSec`)の初期上限(秒)（省略時は `1.2`）
   *
   * - 歩幅(`swingAngle`)は変えず、周期の伸びだけをここで頭打ちにする
   */
  initialMaxWalkCycleSec?: number
  /** セル間移動アニメーションの初期所要時間(ms)（省略時は `150`） */
  initialMoveDurationMs?: number
  /** rotateX の初期角度 (deg)（省略時は 0） */
  initialTiltDeg?: number
  /**
   * セルクリックで actor を移動させるか（省略時は `true`）
   *
   * - `false` にすると `GeoLayer` は非対話になる。クリックを外側のレイヤー
   *   （find-path の予定経路レイヤー等）へ委ねるとき使う
   */
  interactive?: boolean
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
 * - actor の現在セルは外側の `ActorNodeRegistryProvider`（hex 版）が保持する。
 *   `useHexMove` はクリック検証（隣接判定・進入可否）と facing 算出のみ行い、
 *   位置更新は registry の `moveActor` へ委ねる（tick 駆動実行時、外部からクリックを
 *   介さず `moveActor` を直接呼べるようにするため）。複数 actor 対応は対象外（別途検討）
 * - `interactive`（既定 `true`）を `false` にすると `GeoLayer` は非対話になる。
 *   クリックを外側のレイヤー（tick 駆動実行時の予定経路レイヤー等）へ委ねる
 * - セル移動のたび `useHexMove` が算出した進行方向の画面角度を `screenAngleToYaw`
 *   （box-bot-01 のカメラモデルに基づく数値逆算）で yaw へ変換し、bot と共有する
 *   `eventTarget` 経由で `face` action へ dispatch。bot を進行方向へ向かせる
 * - 初期表示時は `pickInitialFacingTarget`(`_lib/hex`) が、現在セル(registry の
 *   初期値)の隣接に進入不可(グリッド範囲外)マスがあれば進入可能マスへ向ける（隅セル対策）
 * - `enableWalking`(既定 `false`)が true のときのみ、移動開始で `walking` action を on
 *   にする（トグル方式のため `isWalkingRef` で on 済みかを追跡）。歩行は到着まで
 *   継続させ、位置決め div の CSS transition 完了（`ActorsLayer` の `onArrived`、
 *   到着＝次の移動が来ないまま静止したタイミング）で `walkingReset()`（腕・脚を
 *   規定位置(0)へ即座にスナップする action）を呼んで歩行を止める。次の移動が
 *   続けば `onArrived` は発火しない（transition が新しい移動先へ上書きされる）ため
 *   自然に on が維持される
 * - `registerCellVisibilityNode` を渡すと hex タイルの表示/非表示を呼び出し元
 *   （visibility registry）に委ねられる（find-path proto-03 で使用）
 * - `canEnterCell` を渡すと `useHexMove` の隣接判定に加えてそのセルへの移動を
 *   拒否できる（find-path proto-03 の障害物セル判定で使用）
 * - `children` は floor 内・`ActorsLayer` の後に重ねる（find-path proto-03 の
 *   ゴールマーカー等、overlay 用途。stage-06 と同一パターン）
 * - セル間移動アニメーションの所要時間(`moveDurationMs`)・walking 周期上限
 *   (`maxWalkCycleSec`)・脚振り角の振幅(`legSwingAngle`)はいずれもスライダーで
 *   調整可能（`ActorsLayer` へ渡す。tilt と異なり操作頻度が低いため `useState`
 *   で管理、再レンダリングを許容する）。腕振り角は 180 度(`ActorsLayer` 内で
 *   固定値)で調整不要とのユーザー判断のため UI なし
 */
/** 到着時、腕・脚を規定位置(0)へ戻す(`walkingReset`)のにかける時間(ms) */
const WALKING_RESET_DURATION_MS = 200
/** 初期向き調整の face dispatch を打ち切るまでの最大フレーム数(listener attach 待ち) */
const INITIAL_FACING_MAX_RETRY_FRAMES = 30

export const Stage07 = (props: Stage07Props) => {
  const {
    actorEventTarget,
    botSize,
    canEnterCell,
    children,
    cols,
    enableWalking = false,
    hexSize,
    initialLegSwingAngle = 0.5,
    initialMaxWalkCycleSec = 1.2,
    initialMoveDurationMs = 150,
    initialTiltDeg = 0,
    interactive = true,
    onCellChange,
    perspectivePx = 800,
    registerCellVisibilityNode,
    rows,
  } = props

  /** セル間移動アニメーションの所要時間(ms)。スライダーで調整可能 */
  const [moveDurationMs, setMoveDurationMs] = useState(initialMoveDurationMs)
  /** walking の脚振り周期(cycleSec)の上限(秒)。スライダーで調整可能 */
  const [maxWalkCycleSec, setMaxWalkCycleSec] = useState(initialMaxWalkCycleSec)
  /** walking の脚振り角の振幅(rad)。スライダーで調整可能 */
  const [legSwingAngle, setLegSwingAngle] = useState(initialLegSwingAngle)

  /**
   * player bot(box-bot-01)と共有する EventTarget
   *
   * - lazy initializer で 1 度だけ生成する（`BoxBotEventProvider` と同じ手法）。
   *   `face` action(進行方向転換)を外部から発火するために `ActorsLayer` へ渡す
   * - `actorEventTarget` prop が渡された場合はそれを使う。呼び出し元(find-path
   *   proto-03 等)が `energyOutAction`(issue #181)のような、`Stage07` 自身が
   *   知らない action を同じ bot へ直接 dispatch できるようにするため
   */
  const [eventTarget] = useState<EventTarget>(
    () => actorEventTarget ?? new EventTarget(),
  )
  const { face, walking, walkingReset } = useBoxBotActionDispatcher(
    eventTarget,
    [faceAction, walkingAction, walkingResetAction],
  )
  const { currentCell, moveActor } = useActorNodeRegistry()

  /** 歩行 action の on 状態(on 側はトグル方式のため呼び出し側で追跡する) */
  const isWalkingRef = useRef(false)
  /** 初期向き調整(下記 useEffect)で最新の `face` を読むための ref */
  const faceRef = useRef(face)
  /** `handleArrived`(useCallback 依存配列空)で最新の enableWalking を読むための ref */
  const enableWalkingRef = useRef(enableWalking)
  /** `handleArrived`(useCallback 依存配列空)で最新の walkingReset を読むための ref */
  const walkingResetRef = useRef(walkingReset)

  useEffect(() => {
    // 毎レンダー最新の face/enableWalking/walkingReset を ref へ反映する
    // (react-hooks/refs: render 中の書込み禁止)
    faceRef.current = face
    enableWalkingRef.current = enableWalking
    walkingResetRef.current = walkingReset
  })

  useEffect(() => {
    // 初期表示時、隣接に進入不可(グリッド範囲外)マスがあれば進入可能マスへ向ける。
    // マウント時に実行する。box-bot-01 の Canvas(r3f の別レンダラ)側で action の
    // listener が attach されるまで数フレーム(実測で 8〜9 フレーム程度)かかるため、
    // INITIAL_FACING_MAX_RETRY_FRAMES フレームの間 rAF で再送し続け、listener attach
    // 後の 1 回を確実に届ける(絶対角度指定の dispatch のため、attach 済み以降の
    // 重複送信は差分 0 の no-op になり無害)
    const target = pickInitialFacingTarget(currentCell, cols, rows)
    const screenAngle = target && hexDirectionToScreenAngle(currentCell, target)

    if (screenAngle === undefined) return

    const rad = screenAngleToYaw(screenAngle)

    let handle = 0
    let frame = 0
    const tick = () => {
      frame += 1
      void faceRef.current({ rad })

      if (frame < INITIAL_FACING_MAX_RETRY_FRAMES) {
        handle = requestAnimationFrame(tick)
      }
    }

    handle = requestAnimationFrame(tick)

    return () => cancelAnimationFrame(handle)
    // マウント時の currentCell(初期値)/cols/rows のみで判定する。face は faceRef 経由
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const { handleCellClick } = useHexMove(
    currentCell,
    moveActor,
    (cell) => {
      if (enableWalking && !isWalkingRef.current) {
        isWalkingRef.current = true
        void walking()
      }

      onCellChange?.(cell)
    },
    (screenAngle) => {
      void face({ rad: screenAngleToYaw(screenAngle) })
    },
    canEnterCell,
  )
  const { floorRef, setTilt } = usePerspectiveControl()

  /**
   * セル間移動アニメーション完了。次の移動が来ないまま止まったら歩行を off にする
   *
   * - `ActorsLayer`（`React.memo` 化済み、issue-181-en backlog）の `onArrived`
   *   prop が毎レンダー新規関数だと memo が効かなくなるため `useCallback`
   *   （依存配列空）で参照を固定する。`enableWalking`/`walkingReset` は ref
   *   経由で最新値を読む
   */
  const handleArrived = useCallback(() => {
    if (!enableWalkingRef.current || !isWalkingRef.current) return

    isWalkingRef.current = false
    void walkingResetRef.current(WALKING_RESET_DURATION_MS)
  }, [])

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
            canEnterCell={canEnterCell}
            cols={cols}
            currentCell={currentCell}
            hexSize={hexSize}
            interactive={interactive}
            onCellClick={handleCellClick}
            registerVisibilityNode={registerCellVisibilityNode}
            rows={rows}
          />
          <ActorsLayer
            cols={cols}
            currentCell={currentCell}
            eventTarget={eventTarget}
            hexSize={hexSize}
            legSwingAngle={legSwingAngle}
            maxWalkCycleSec={maxWalkCycleSec}
            moveDurationMs={moveDurationMs}
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
      <label>
        移動時間(ms){' '}
        <input
          defaultValue={initialMoveDurationMs}
          max={3000}
          min={50}
          onChange={(event) => {
            setMoveDurationMs(Number(event.target.value))
          }}
          step={10}
          type="range"
        />{' '}
        {moveDurationMs}ms
      </label>
      <label>
        歩行周期上限(s){' '}
        <input
          defaultValue={initialMaxWalkCycleSec}
          max={3}
          min={0.3}
          onChange={(event) => {
            setMaxWalkCycleSec(Number(event.target.value))
          }}
          step={0.05}
          type="range"
        />{' '}
        {maxWalkCycleSec.toFixed(2)}s
      </label>
      <label>
        脚振り角(rad){' '}
        <input
          defaultValue={initialLegSwingAngle}
          max={1.2}
          min={0}
          onChange={(event) => {
            setLegSwingAngle(Number(event.target.value))
          }}
          step={0.05}
          type="range"
        />{' '}
        {legSwingAngle.toFixed(2)}
      </label>
    </div>
  )
}
