import type { ThreeEvent } from '@react-three/fiber'
import type { RefObject } from 'react'
import type { Group } from 'three'

import type { JumpConfig } from './_actions/jump/config'

export type { JumpConfig, JumpOverride } from './_actions/jump/config'

export interface ArmSideState {
  /** 上がっているか */
  up: boolean
}

export interface BoxBot3DConfig {
  /** 腕の設定 */
  arm: {
    /** 奥行き */
    d: number
    /**
     * 左腕の角度(z 軸回転)
     *
     * - leftUp = false(下げ)時の値
     */
    leftAngle: number
    /** 左腕の長さ */
    leftLen: number
    /**
     * 右腕の角度(z 軸回転)
     *
     * - rightUp = true(上げ)時の値
     */
    rightAngle: number
    /** 右腕の長さ */
    rightLen: number
    /** 幅 */
    w: number
  }
  /** 胴体の設定 */
  body: {
    /** 奥行き */
    d: number
    /** 高さ */
    h: number
    /** 幅 */
    w: number
  }
  /** 目の設定 */
  eye: {
    /** 奥行き */
    d: number
    /** 高さ */
    h: number
    /** 中心からの左右オフセット */
    offset: number
    /** 幅 */
    w: number
  }
  /** 頭の設定 */
  head: {
    /** 奥行き */
    d: number
    /** 高さ */
    h: number
    /** 幅 */
    w: number
  }
  /** 線(輪郭・目・口)の色 */
  ink: string
  /** ジャンプ(単発 jump / 待機 hopping 共通)の設定。型・既定値は `_actions/jump` が持つ */
  jump: JumpConfig
  /** 脚の設定 */
  leg: {
    /** 奥行き */
    d: number
    /** 左右の脚の間隔比率(胴幅に対する倍率) */
    gap: number
    /** 高さ */
    h: number
    /** 幅 */
    w: number
  }
  /** 辺の太さ(px) */
  lineWidth: number
  /** 反転ハルのシルエット縁取り */
  outline: boolean
  /** 縁取りの太さ(world) */
  outlineWidth: number
  /** 箱本体(紙面)の色 */
  paper: string
  /** ジッターの固定シード */
  seed: number
  /**
   * 手描きジッター振幅(world)
   *
   * - 0 = 直線
   */
  sketch: number
  /**
   * 分割密度(1あたりの分割数)
   *
   * - 大きいほど細かく震える
   */
  sketchDetail: number
}

export interface BoxBotModelProps extends Partial<BoxBot3DConfig> {
  /** 自動回転の有無 */
  autoRotate?: boolean
  /**
   * マウント時に自動で歩き始める歩き方(省略時: 歩かない)
   *
   * - Canvas 内部(マウント完了後)で直接 ref をセットする。`useBoxBotActionDispatcher`\
   *   経由の toggle は Canvas 外部からの発行になり、初回マウント直後は\
   *   listener 登録前にイベントが発行されるタイミング競合の余地があるため、\
   *   確実な初期状態指定にはこちらを使う
   */
  autoWalk?: LegStyle
  /**
   * body 全体の上下(bobbing)を有効にするか
   *
   * - walking(脚 swing)・marching(脚 bob)いずれかの実際の動きから高さを計算する。\
   *   どちらも歩いていない間は連動する脚の動きがないため無効
   */
  bodyBobbing?: boolean
  /** body/head/arm クリックで発火する action の対応。省略したキーは既定のまま */
  clickActionMap?: ClickActionMap
  /**
   * 表示領域(Canvas ラッパー)の DOM ref
   *
   * - `BoxBot3D`(bot の外殻)が生成し、Canvas 内のアクションへ橋渡しする\
   *   (Context は r3f Canvas 境界を越えないため props 配線)
   * - jump は縦移動をこの要素の `top` 書き換えで行い、設置領域を上方向へ逸脱させて\
   *   可動域を確保する(#108)。bot 本体はこの ref の用途を知らない
   */
  displayAreaRef?: RefObject<HTMLDivElement | null>
  /**
   * action イベント発行/購読に使う EventTarget
   *
   * - 省略時は instance 固有のものを内部生成
   */
  eventTarget?: EventTarget
  /**
   * マウント時に自動で hopping(待機演出、bot への hover/touch 中・回転中以外は連続ジャンプ)を\
   * 開始するか(省略時: hopping しない)
   *
   * - `autoWalk` と同じ理由(タイミング競合回避)で、Canvas 内部で直接 ref をセットする
   */
  hopping?: boolean
  /** クリック操作(腕上げ下げ・ホップ)を有効にするか */
  interactive?: boolean
  /** 脚アニメーション(walking/marching 共通)の周期(秒) */
  legCycle?: number
  /**
   * body/head クリック確定で発火するコールバック
   *
   * - r3f 標準の click(pointerdown/pointerup が同一要素上で完結した場合のみ発火)を使うため、\
   *   bot 外へドラッグして離した場合は発火しない(通常の a要素のクリックと同じセマンティクス)
   */
  onClick?: () => void
  /** 自動回転の速度 */
  rotateSpeed?: number
  /**
   * 初期 y 軸回転(ラジアン、既定: 0)
   *
   * - `autoRotate` 有効時はこの値を起点に加算回転する
   */
  rotationY?: number
}

/** BoxBotRefsProvider が配布する ref 群 */
export interface BoxBotRefs {
  /** bot 自体(body/head/arm)に hover(PC)・touch(モバイル)しているかどうかの ref */
  botHoverRef: RefObject<boolean>
  /**
   * 転倒/起き上がりの回転制御グループ ref
   *
   * - `rootRef` 直下、脚の接地点(下方)へ position で移動した内側に配置し、\
   *   ここへ回転をかけることで回転中心を体の中心でなく接地点にする
   */
  fallPivotRef: RefObject<Group | null>
  /**
   * 転倒進行度の ref
   *
   * - -1: 非実行中、0以上: 経過秒数
   */
  fallRef: RefObject<number>
  /**
   * 起き上がり進行度の ref
   *
   * - -1: 非実行中、0以上: 経過秒数
   */
  getUpRef: RefObject<number>
  /**
   * hopping、次のジャンプまでの待ち時間の ref
   *
   * - -1: 待機中でない(ジャンプ中、または hopping 自体が非アクティブ)、0以上: 経過秒数
   */
  hoppingCooldownRef: RefObject<number>
  /** hopping(待機演出)状態かどうかの ref */
  hoppingRef: RefObject<boolean>
  /** 左腕の回転支点グループ ref */
  leftArmRef: RefObject<Group | null>
  /** 左脚のグループ ref */
  leftLegRef: RefObject<Group | null>
  /** 足踏みしている状態か(見た目の挙動は含まない)の ref */
  marchingRef: RefObject<boolean>
  /**
   * 姿勢の ref
   *
   * - 0: 直立、1: 倒れている(中間値は fall/getUp 進行中のみ一時的に取りうる)
   */
  postureRef: RefObject<number>
  /** 右腕の回転支点グループ ref */
  rightArmRef: RefObject<Group | null>
  /** 右脚のグループ ref */
  rightLegRef: RefObject<Group | null>
  /** 全体のジャンプ・スケール・転倒回転制御グループ ref */
  rootRef: RefObject<Group | null>
  /**
   * 回転(加速→押下中は最大速度維持→解放で減速して停止) action 進行度の ref
   *
   * - -1: 非実行中、0以上: 経過秒数(解放後は加算を止め、離した瞬間の値で凍結)
   */
  spinActionRef: RefObject<number>
  /** 回転 action の押下(body/head)継続中かどうかの ref */
  spinHeldRef: RefObject<boolean>
  /** 自動回転グループ ref */
  spinRef: RefObject<Group | null>
  /** 押下解放後の回転減速 進行度の ref。-1: 押下中または非実行、0以上: 解放からの経過秒数 */
  spinReleaseElapsedRef: RefObject<number>
  /** 歩行中の body 全体上下(bobbing)制御グループ ref */
  walkingBobRef: RefObject<Group | null>
  /** 歩いている状態か(見た目の挙動は含まない)の ref */
  walkingRef: RefObject<boolean>
}

/** 要素クリック → action イベントの対応。各キー省略時は既定の action を使う */
export interface ClickActionMap {
  /** 左腕クリックで発火する action イベント名(既定: ACTION_ARM_LEFT_TOGGLE) */
  armLeft?: string
  /** 右腕クリックで発火する action イベント名(既定: ACTION_ARM_RIGHT_TOGGLE) */
  armRight?: string
  /** body クリックで発火する action イベント名(既定: ACTION_JUMP) */
  body?: string
  /** head クリックで発火する action イベント名(既定: ACTION_JUMP) */
  head?: string
}

export type Handlers = {
  onClick?: (e: ThreeEvent<MouseEvent>) => void
  onPointerDown?: (e: ThreeEvent<PointerEvent>) => void
  onPointerOut?: (e: ThreeEvent<PointerEvent>) => void
  onPointerOver?: (e: ThreeEvent<PointerEvent>) => void
  onPointerUp?: (e: ThreeEvent<PointerEvent>) => void
}

/**
 * `useBoxBotActionDispatcher` の戻り値のうち、まだレジストリ化していないアクション分
 *
 * - レジストリ化済み(`BOX_BOT_ACTIONS`)の分は `use-box-bot-action-dispatcher` 側で\
 *   `BoxBotActionDispatchers` により自動導出し、この型と合成する
 */
export interface LegacyBoxBotActionDispatchers {
  /** 左腕上げ下げ action を発火する */
  armLeftToggle: () => Promise<void>
  /** 右腕上げ下げ action を発火する */
  armRightToggle: () => Promise<void>
  /** 転倒 action を発火する(直立時のみ実行される) */
  fall: () => Promise<void>
  /** 起き上がり action を発火する(倒れている時のみ実行される) */
  getUp: () => Promise<void>
  /** hopping(待機演出)を開始する */
  hoppingStart: () => Promise<void>
  /** hopping(待機演出)を停止する */
  hoppingStop: () => Promise<void>
  /** 足踏みしている状態(marching)の toggle action を発火する */
  marchingToggle: () => Promise<void>
  /** 歩いている状態(walking)の toggle action を発火する */
  walkingToggle: () => Promise<void>
}

/** 歩き方。'swing': walking action、'bob': marching action */
export type LegStyle = 'bob' | 'swing'

export interface UseBoxBotModelReturn extends Pick<
  BoxBotRefs,
  | 'fallPivotRef'
  | 'leftArmRef'
  | 'leftLegRef'
  | 'marchingRef'
  | 'postureRef'
  | 'rightArmRef'
  | 'rightLegRef'
  | 'rootRef'
  | 'spinRef'
  | 'walkingBobRef'
  | 'walkingRef'
> {
  /** 左右の腕の状態・操作 */
  arm: {
    /** 左腕 */
    left: ArmSideState
    /** 右腕 */
    right: ArmSideState
  }
  /** マージ後の設定値 */
  cfg: BoxBot3DConfig
  /** 左腕クリックで CLICK_ARM_LEFT を発火(実行される action は clickActionMap prop 側の対応で決まる) */
  clickArmLeft: (e: ThreeEvent<MouseEvent>) => void
  /** 右腕クリックで CLICK_ARM_RIGHT を発火(実行される action は clickActionMap prop 側の対応で決まる) */
  clickArmRight: (e: ThreeEvent<MouseEvent>) => void
  /** body 押下で CLICK_BODY を発火(実行される action は clickActionMap prop 側の対応で決まる) */
  clickBody: (e: ThreeEvent<PointerEvent>) => void
  /** head 押下で CLICK_HEAD を発火(実行される action は clickActionMap prop 側の対応で決まる) */
  clickHead: (e: ThreeEvent<PointerEvent>) => void
  /** 接地面(脚の下端)の y 座標。fall/getUp の回転中心に使う */
  groundY: number
  /** 頭の前面 z 座標 */
  headFront: number
  /** 頭の中心 y 座標 */
  headY: number
  /** ホバー時のカーソル制御ハンドラ */
  hover: Handlers
  /** インタラクション有効か */
  interactive: boolean
  /** 脚の x オフセット */
  legX: number
  /** 脚グループの付け根 y 座標 */
  legY: number
  /** body/head クリック確定で発火するコールバック(props.onClick そのまま) */
  onClick?: () => void
  /** body 押下解放(pointer up/out)で CLICK_BODY_RELEASE を発火(spin action が押下継続判定に直接購読) */
  releaseBody: (e: ThreeEvent<PointerEvent>) => void
  /** head 押下解放(pointer up/out)で CLICK_HEAD_RELEASE を発火(spin action が押下継続判定に直接購読) */
  releaseHead: (e: ThreeEvent<PointerEvent>) => void
  /** 初期 y 軸回転(ラジアン) */
  rotationY: number
  /** 肩の x オフセット */
  shoulderX: number
  /** 肩の y 座標 */
  shoulderY: number
  /** 転倒開始(直立時のみ実行される) */
  startFall: () => void
  /** 起き上がり開始(倒れている時のみ実行される) */
  startGetUp: () => void
}
