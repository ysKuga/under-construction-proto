'use client'

import {
  ComponentProps,
  CSSProperties,
  PropsWithChildren,
  ReactNode,
  Ref,
  useCallback,
  useEffect,
  useImperativeHandle,
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

import { usePerspectiveControl } from './_hooks/use-perspective-control'
import { PLAYER_ACTOR_ID } from './constants'

import { ActorOverlayLayer } from './_components/actor-overlay-layer'
import { ActorsLayer } from './_components/actors-layer'
import { GeoLayer } from './_components/geo-layer'
import { useStage07EventDispatcher } from './_events'
import { useFollowPath } from './_hooks/use-follow-path'
import { useHexMove } from './_hooks/use-hex-move'
import {
  HexCell,
  hexDirectionToScreenAngle,
  pickInitialFacingTarget,
} from './_lib/hex'
import { useActorsStore } from './_stores/actors'
import { SLIDER_LABEL_STYLE } from './constants'

/** `Stage07` が呼び出し元へ公開する imperative API */
export type Stage07Handle = {
  /**
   * player を `path` に沿って 1 マスずつ自動移動させる
   *
   * - `path` は現在地セルを含まない隣接セルの連なり(`findHexPath` の戻り値と同形)
   * - 各マスの移動はクリック移動と同じ検証(`canEnterCell`)を通す。進入不可なら
   *   その場で停止する。終了は `onFollowPathEnd` で通知する
   */
  followPath: (path: HexCell[]) => void
  /**
   * player を隣接セル `cell` へ 1 マス移動させる。移動したら `true`、隣接でない・進入不可なら `false`
   *
   * - クリック移動と同じ検証(隣接判定・`canEnterCell`)を通し、移動成立時は
   *   `onCellChange`・`Stage07-move-start` を通知する
   * - 呼出し側(`Stage07-cell-click` の購読側等)がクリックを分類して移動を命令するために使う
   */
  moveTo: (cell: HexCell) => boolean
  /**
   * 床の傾き(rotateX, deg)を設定する
   *
   * - 再レンダリングを起こさず style を直接書き換える（`usePerspectiveControl`）
   * - 0〜85 にクランプする
   */
  setTilt: (deg: number) => void
  /**
   * player を移動アニメーションなしで `cell` へ移す
   *
   * - 通過マスの到達(`Stage07-cell-reach`)は発行せず、`cell` の到達のみ発行する
   * - 移動成立の通知(`onCellChange`・`Stage07-move-start`/`Stage07-move-stop`)は行わない
   * - 向きは `pickInitialFacingTarget` で選んだ隣接マスへ向ける
   * - 停止中の呼出を前提とする（移動中の歩行・自動移動は止めない）
   */
  warp: (cell: HexCell) => void
}

type Stage07Props = PropsWithChildren<{
  /**
   * player bot と共有する EventTarget（省略可）
   *
   * - 省略時は box-bot-01 が instance 固有のものを内部生成する
   * - EN 切れ演出(`energyOutAction`、issue #181)等、呼び出し元から直接 dispatch
   *   したい action がある場合に渡す（stage-06 と同じ方式）
   */
  actorEventTarget?: EventTarget
  /**
   * 床の直下へ置く要素（省略可）
   *
   * - 調整スライダー群より上、床と同じ幅で置く（find-path proto-03 のセル情報パネル等）
   */
  belowFloor?: ReactNode
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
  /**
   * 組込みの調整スライダー群（体の上下量）の後に追加するスライダー（省略可）
   *
   * - 呼び出し元固有の値（find-path proto-03 の EN 等）を同じ並びで調整するため。\
   *   列幅は `SLIDER_LABEL_STYLE`（`./constants`）で揃える
   */
  extraSliders?: ReactNode
  /** 六角形の外接円半径 (px) */
  hexSize: number
  /**
   * 歩行中の体の上下(body-bobbing)の初期最大持ち上げ量(world)（省略時は `0.1`）
   *
   * - `BODY_BOBBING_DEFAULTS.height`(0.025)は Canvas 一辺 234px 基準。stage 上の小さい bot
   *   (56px 程度)では 1px 未満になり視認できないため、既定を大きめにする
   */
  initialBodyBobHeight?: number
  /** walking の脚振り角の初期振幅(rad)（省略時は `WALKING_DEFAULTS.swingAngle` = `0.5`） */
  initialLegSwingAngle?: number
  /**
   * walking の脚振り周期(`cycleSec`)の初期上限(秒)（省略時は `1.2`）
   *
   * - 歩幅(`swingAngle`)は変えず、周期の伸びだけをここで頭打ちにする
   */
  initialMaxWalkCycleSec?: number
  /** セル間移動アニメーションの初期所要時間(ms)（省略時は `300`） */
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
  /**
   * `followPath` による自動移動の終了時（省略可）
   *
   * - 最終セル到着で終了した場合は引数なし。途中で進入不可(EN 切れ等)により
   *   停止した場合は進入できなかったセルを渡す
   */
  onFollowPathEnd?: (blockedCell?: HexCell) => void
  /** perspective 視点距離 (px)。小さいほど遠近が強い（省略時は 800） */
  perspectivePx?: number
  /** imperative API(`Stage07Handle`)の受け取り先（省略可） */
  ref?: Ref<Stage07Handle>
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
 *   `usePerspectiveControl`（stage-05 からコピー）が `--floor-tilt` を ref 直書き
 * - actor(player・mob 共通)の位置は外側の `ActorsStoreProvider`（zustand store）が
 *   `actorId` ごとに保持する。`useHexMove` はクリック検証（隣接判定・進入可否）と
 *   facing 算出のみ行い、位置更新は store の `moveActor` へ委ねる（tick 駆動実行時、
 *   外部からクリックを介さず `moveActor` を直接呼べるようにするため）。`Stage07` 自身は
 *   `PLAYER_ACTOR_ID` の位置のみ扱う。mob(player 以外の actor)は `ActorsLayer` が
 *   store を直接 selector 購読して描画するため props 経由では受け取らない(issue #215)。
 *   spawn/despawn は呼び出し元が `useActorsStoreApi` 経由で store を直接操作する
 * - `interactive`（既定 `true`）を `false` にすると `GeoLayer` は非対話になる。
 *   クリックを外側のレイヤー（tick 駆動実行時の予定経路レイヤー等）へ委ねる
 * - セル移動のたび `useHexMove` が算出した進行方向の画面角度を `screenAngleToYaw`
 *   （box-bot-01 のカメラモデルに基づく数値逆算）で yaw へ変換し、bot と共有する
 *   `eventTarget` 経由で `face` action へ dispatch。bot を進行方向へ向かせる
 * - 初期表示時は向きを調整しない（表示後に向きが切り替わって見えるため）
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
 * - セルのクリックは分類（現在セル・移動可・不可）せず `Stage07-cell-click` で発行するのみ。
 *   移動は呼び出し側が分類し `Stage07Handle.moveTo` で命令する。単体で隣接クリック移動
 *   させる場合は `MoveOnAdjacentCellClick` を置く。選択可能表示（`cursor: pointer`）は
 *   `GeoLayer` が `_lib/cell-selectable` の `isCellSelectable` で判定する。分類する呼び出し側も同じ関数を使い揃える
 * - `ref`（`Stage07Handle.moveTo`）で隣接セルへの 1 マス移動を命令できる
 * - `ref`（`Stage07Handle.followPath`）で経路に沿った自動移動を命令できる
 *   （`useFollowPath`、issue #226）。1 マスごとにクリック移動と同じ検証を通し、
 *   進入不可ならその場で停止して `onFollowPathEnd` へ通知する
 * - `ref`（`Stage07Handle.warp`）で移動アニメーションなしに任意セルへ移せる
 *   （store の `moveActor` に移動種別 `warp` を指定、issue #289）。チェックポイントへのリセット等で使う
 * - actor の移動開始・停止は `Stage07EventProvider`（`_events`、`Stage07` の外側に置く）の
 *   EventTarget へ `Stage07-move-start`/`Stage07-move-stop` として発行する。停止箇所に
 *   着いてから行う演出（find-path proto-03 の EN 切れ演出等）で使う。Provider がなければ
 *   何も起きない
 * - `children` は floor 内・`ActorsLayer` の後に重ねる（find-path proto-03 の
 *   ゴールマーカー等、overlay 用途。stage-06 と同一パターン）
 * - player bot 頭上へのオーバーレイ注入用コンテナは `ActorOverlayLayer` が
 *   floor の 3D 空間外(scene の後ろ)に用意し、`useActorsStore` の
 *   `registerOverlayContainer` で登録する（props でなく store 経由、actor に
 *   紐づく実装のため）。呼び出し側は同じ `useActorsStore` から
 *   `overlayContainers[actorId]` を直接読み、`createPortal` で任意の要素（bot
 *   頭上に表示したい吹き出し等、複数可）を注入できる。`children`（floor 直下、
 *   セル座標基準の overlay）と異なり、bot の画面上の位置へ JS で追従し、
 *   floor の奥行きヒットテストでセルにクリックを奪われない点が違う（issue #137）
 * - セル間移動アニメーションの所要時間(`moveDurationMs`)・walking 周期上限
 *   (`maxWalkCycleSec`)・脚振り角の振幅(`legSwingAngle`)・体の上下量(`bodyBobHeight`)はいずれもスライダーで
 *   調整可能（`ActorsLayer` へ渡す。tilt と異なり操作頻度が低いため `useState`
 *   で管理、再レンダリングを許容する）。腕振り角は 180 度(`ActorsLayer` 内で
 *   固定値)で調整不要とのユーザー判断のため UI なし
 */
/**
 * ワープ時の向き(yaw, rad)を返す
 *
 * - `pickInitialFacingTarget` で選んだ隣接マスへ向ける。向ける先がなければ `undefined`
 */
const computeWarpFacingRad = (
  cell: HexCell,
  cols: number,
  rows: number,
): number | undefined => {
  const target = pickInitialFacingTarget(cell, cols, rows)
  const screenAngle = target && hexDirectionToScreenAngle(cell, target)

  return screenAngle === undefined ? undefined : screenAngleToYaw(screenAngle)
}

/** 到着時、腕・脚を規定位置(0)へ戻す(`walkingReset`)のにかける時間(ms) */
const WALKING_RESET_DURATION_MS = 200

export const Stage07 = (props: Stage07Props) => {
  const {
    actorEventTarget,
    belowFloor,
    botSize,
    canEnterCell,
    children,
    cols,
    enableWalking = false,
    extraSliders,
    hexSize,
    initialBodyBobHeight = 0.1,
    initialLegSwingAngle = 0.5,
    initialMaxWalkCycleSec = 1.2,
    initialMoveDurationMs = 300,
    initialTiltDeg = 0,
    interactive = true,
    onCellChange,
    onFollowPathEnd,
    perspectivePx = 800,
    ref,
    registerCellVisibilityNode,
    rows,
  } = props

  /** セル間移動アニメーションの所要時間(ms)。スライダーで調整可能 */
  const [moveDurationMs, setMoveDurationMs] = useState(initialMoveDurationMs)
  /** walking の脚振り周期(cycleSec)の上限(秒)。スライダーで調整可能 */
  const [maxWalkCycleSec, setMaxWalkCycleSec] = useState(initialMaxWalkCycleSec)
  /** walking の脚振り角の振幅(rad)。スライダーで調整可能 */
  const [legSwingAngle, setLegSwingAngle] = useState(initialLegSwingAngle)
  const [bodyBobHeight, setBodyBobHeight] = useState(initialBodyBobHeight)

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
  /** player の現在セル。store は player・mob 共通で保持するため `PLAYER_ACTOR_ID` で引く */
  const currentCell = useActorsStore((state) => state.actors[PLAYER_ACTOR_ID])
  const moveActorTo = useActorsStore((state) => state.moveActor)

  /** 歩行 action の on 状態(on 側はトグル方式のため呼び出し側で追跡する) */
  const isWalkingRef = useRef(false)
  /** `warp`(useCallback)で最新の `face` を読むための ref */
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

  const stage07EventDispatcher = useStage07EventDispatcher()

  const { tryMove } = useHexMove(
    currentCell,
    (cell) => moveActorTo(PLAYER_ACTOR_ID, cell),
    (cell) => {
      if (enableWalking && !isWalkingRef.current) {
        isWalkingRef.current = true
        void walking()
      }

      void stage07EventDispatcher['Stage07-move-start']({
        actorId: PLAYER_ACTOR_ID,
      })
      onCellChange?.(cell)
    },
    (screenAngle) => {
      void face({ rad: screenAngleToYaw(screenAngle) })
    },
    canEnterCell,
  )

  const { floorRef, setTilt } = usePerspectiveControl()

  /**
   * 歩行を off にする(腕・脚を規定位置へ戻す)
   *
   * - `enableWalking`/`walkingReset` は ref 経由で最新値を読む（`handleArrived`
   *   の参照固定のため依存配列空）
   */
  const stopWalking = useCallback(() => {
    if (!enableWalkingRef.current || !isWalkingRef.current) return

    isWalkingRef.current = false
    void walkingResetRef.current(WALKING_RESET_DURATION_MS)
  }, [])

  const { followPath, notifyArrived } = useFollowPath(
    tryMove,
    moveDurationMs,
    (blockedCell) => {
      stopWalking()
      void stage07EventDispatcher['Stage07-move-stop']({
        actorId: PLAYER_ACTOR_ID,
      })
      onFollowPathEnd?.(blockedCell)
    },
  )

  const warp = useCallback(
    (cell: HexCell) => {
      moveActorTo(PLAYER_ACTOR_ID, cell, { kind: 'warp' })

      const rad = computeWarpFacingRad(cell, cols, rows)

      if (rad !== undefined) void faceRef.current({ rad })
    },
    [cols, moveActorTo, rows],
  )

  useImperativeHandle(
    ref,
    () => ({ followPath, moveTo: tryMove, setTilt, warp }),
    [followPath, setTilt, tryMove, warp],
  )

  /**
   * セル間移動アニメーション完了。次の移動が来ないまま止まったら歩行を off にする
   *
   * - `ActorsLayer`（`React.memo` 化済み、issue-181-en backlog）の `onArrived`
   *   prop が毎レンダー新規関数だと memo が効かなくなるため `useCallback`
   *   で参照を固定する
   * - 自動移動(`followPath`)中は途中の到着で歩行を止めない。停止（`Stage07-move-stop`
   *   の発行含む）は `useFollowPath` の終了通知側で行う
   */
  const handleArrived = useCallback(() => {
    if (notifyArrived()) return

    stopWalking()
    void stage07EventDispatcher['Stage07-move-stop']({
      actorId: PLAYER_ACTOR_ID,
    })
  }, [notifyArrived, stage07EventDispatcher, stopWalking])

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
    <div style={{ position: 'relative' }}>
      {/* 床と belowFloor を縦に並べ、belowFloor の幅を床に合わせる */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: 'min-content',
        }}
      >
        <div style={sceneStyle}>
          <div ref={floorRef} style={floorStyle}>
            <GeoLayer
              cols={cols}
              hexSize={hexSize}
              interactive={interactive}
              registerVisibilityNode={registerCellVisibilityNode}
              rows={rows}
            />
            <ActorsLayer
              bodyBobHeight={bodyBobHeight}
              cols={cols}
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
        {belowFloor}
      </div>
      <ActorOverlayLayer />
      <label style={SLIDER_LABEL_STYLE}>
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
      <label style={SLIDER_LABEL_STYLE}>
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
      <label style={SLIDER_LABEL_STYLE}>
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
      <label style={SLIDER_LABEL_STYLE}>
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
      <label style={SLIDER_LABEL_STYLE}>
        体の上下量{' '}
        <input
          defaultValue={initialBodyBobHeight}
          max={0.3}
          min={0}
          onChange={(event) => {
            setBodyBobHeight(Number(event.target.value))
          }}
          step={0.01}
          type="range"
        />{' '}
        {bodyBobHeight.toFixed(2)}
      </label>
      {extraSliders}
    </div>
  )
}
