'use client'

import type { ThreeEvent } from '@react-three/fiber'
import type { RefObject } from 'react'
import type { Group } from 'three'

import { useEventDispatcher } from '@/hooks/event'

import type { BoxBotActionBaseHost } from '../../_actions/types'

import { useClickBindings } from './_hooks/use-click-bindings'
import { deriveLayout } from './_lib/derive-layout'
import { DEFAULTS, ON_CLICK_ELEMENT } from './index.constants'
import {
  useBoxBotActions,
  useBoxBotEventTarget,
  useBoxBotRefs,
} from './index.contexts'
import type {
  BoxBot3DConfig,
  BoxBotModelProps,
  ClickElementDetail,
  ClickTarget,
  Handlers,
  UseBoxBotModelReturn,
} from './index.types'

// --- adapter の書き込み口 ---------------------------------------------------
// bot 内部構造(THREE.Group / 表示領域 DOM)へ触れるのはここだけ。module scope
// なので react-hooks/refs の対象外。useBoxBotModel からは ref オブジェクトを渡す。

/** 全体グループへ squash(scale)を適用する。`sx` は x/z、`sy` は y */
const writeSquash = (
  rootRef: RefObject<Group | null>,
  sx: number,
  sy: number,
): void => {
  rootRef.current?.scale.set(sx, sy, sx)
}

/**
 * 表示領域(Canvas ラッパー)を中央から `x`(右)/ `y`(上)px ずらす(#108)
 *
 * - 基準位置 left:50% / top:50%(JSX 側)からずらす。transform は中央寄せ専用に固定
 */
const writeShift = (
  displayAreaRef: RefObject<HTMLDivElement | null> | undefined,
  offset: { x: number; y: number },
): void => {
  if (displayAreaRef?.current) {
    displayAreaRef.current.style.left = `calc(50% + ${offset.x}px)`
    displayAreaRef.current.style.top = `calc(50% - ${offset.y}px)`
  }
}

/** y 軸回転グループへ `rad` を増分加算する */
const writeYawDelta = (yawRef: RefObject<Group | null>, rad: number): void => {
  if (yawRef.current) yawRef.current.rotation.y += rad
}

/** 接地影グループ(`shadowLiftRef`)の持ち上げ量(`position.y`)を `y` に設定する(fall) */
const writeShadowLift = (
  shadowLiftRef: RefObject<Group | null> | undefined,
  y: number,
): void => {
  if (shadowLiftRef?.current) shadowLiftRef.current.position.y = y
}

/** 前傾グループ(`fallPivotRef`)の前傾角(`rotation.x`)を `rad` に設定する(fall) */
const writeTilt = (
  fallPivotRef: RefObject<Group | null>,
  rad: number,
): void => {
  if (fallPivotRef.current) fallPivotRef.current.rotation.x = rad
}

/** 左右の腕グループの前方スイング角(`rotation.x`)を `rad` に設定する(fall) */
const writeArmAngle = (
  leftArmRef: RefObject<Group | null>,
  rightArmRef: RefObject<Group | null>,
  rad: number,
): void => {
  if (leftArmRef.current) leftArmRef.current.rotation.x = rad
  if (rightArmRef.current) rightArmRef.current.rotation.x = rad
}

/** 左右の腕グループの持ち上げ角(`rotation.z`)を個別に設定する(arm-toggle) */
const writeArmLift = (
  leftArmRef: RefObject<Group | null>,
  rightArmRef: RefObject<Group | null>,
  left: number,
  right: number,
): void => {
  if (leftArmRef.current) leftArmRef.current.rotation.z = left
  if (rightArmRef.current) rightArmRef.current.rotation.z = right
}

/** 左右の脚グループの前後スイング角(`rotation.x`)を個別に設定する(walking) */
const writeLegSwing = (
  leftLegRef: RefObject<Group | null>,
  rightLegRef: RefObject<Group | null>,
  left: number,
  right: number,
): void => {
  if (leftLegRef.current) leftLegRef.current.rotation.x = left
  if (rightLegRef.current) rightLegRef.current.rotation.x = right
}

/**
 * 左右の脚グループの足踏みオフセットを個別に設定する(marching)
 *
 * - `baseY`(脚の付け根 `layout.leg.y`)からの相対量として `position.y` へ反映する
 */
const writeLegBob = (
  leftLegRef: RefObject<Group | null>,
  rightLegRef: RefObject<Group | null>,
  baseY: number,
  left: number,
  right: number,
): void => {
  if (leftLegRef.current) leftLegRef.current.position.y = baseY + left
  if (rightLegRef.current) rightLegRef.current.position.y = baseY + right
}

/**
 * 現在の実効 facing(bot の向き)を rad で返す(fall の画面ずらし方向の基準)
 *
 * - 初期回転 `rotationY` に `yawRef` の累積回転(spin / autoRotate)を足したもの
 */
const readFacing = (
  yawRef: RefObject<Group | null>,
  rotationY: number,
): number => rotationY + (yawRef.current?.rotation.y ?? 0)

/** 姿勢フェーズ(`postureRef`)を返す。0 = 直立、非 0 = 転倒/横倒し/起き上がり中 */
const readPosture = (postureRef: RefObject<number>): number =>
  postureRef.current

/** 姿勢フェーズ(`postureRef`)を `phase` に設定する(fall が `phaseRef` の遷移で呼ぶ) */
const writePosture = (postureRef: RefObject<number>, phase: number): void => {
  postureRef.current = phase
}

/** BoxBotModel のロジック(設定マージ・ジオメトリ寸法・アクション実行) */
export function useBoxBotModel(
  props: Omit<BoxBotModelProps, 'actions' | 'clickBindings' | 'eventTarget'>,
): UseBoxBotModelReturn {
  const {
    actionConfig,
    interactive = true,
    onClick,
    rotationY = 0,
    ...opts
  } = props

  const cfg: BoxBot3DConfig = {
    ...DEFAULTS,
    ...opts,
    arm: { ...DEFAULTS.arm, ...opts.arm },
    body: { ...DEFAULTS.body, ...opts.body },
    eye: { ...DEFAULTS.eye, ...opts.eye },
    head: { ...DEFAULTS.head, ...opts.head },
    leg: { ...DEFAULTS.leg, ...opts.leg },
  }

  const { actions } = useBoxBotActions()

  const { arm, fallPivotRef, leg, postureRef, rootRef, walkingBobRef, yawRef } =
    useBoxBotRefs()

  const eventTarget = useBoxBotEventTarget()
  const dispatch = useEventDispatcher(eventTarget)

  const setCursor = (v: string) => {
    if (typeof document !== 'undefined') document.body.style.cursor = v
  }
  // クリック可能であることを示すカーソルのみ(状態は持たない)
  const hover: Handlers = interactive
    ? {
        onPointerOut: () => setCursor('auto'),
        onPointerOver: (e) => {
          e.stopPropagation()
          setCursor('pointer')
        },
      }
    : {}

  // 要素の押下 → その要素を detail に載せた ON_CLICK_ELEMENT を発行するハンドラを作る。
  // どの部位を割り当てるかは呼び出し側(部位を定義する JSX)が決める。
  // どの action へ繋ぐかは use-click-bindings 側。ここは何も知らない
  const createClickEmitter =
    (target: ClickTarget) => (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation()
      void dispatch(
        new CustomEvent<ClickElementDetail>(ON_CLICK_ELEMENT, {
          detail: { target },
        }),
      )
    }

  // 要素イベント → action イベントの中継(対応表は Context から取得)
  useClickBindings(eventTarget)

  const { displayAreaRef, shadowLiftRef } = props

  const layout = deriveLayout(cfg)

  // アクションへ渡す操作面(adapter)。bot 内部構造(THREE.Group / 表示領域 DOM)への
  // 書き込みは module scope の write* に閉じ込め、ここでは ref オブジェクトを渡すだけ
  // にする(レンダーフェーズで .current を触らない = react-hooks/refs)。
  // config 差し込みは各 descriptor (defineAction のラッパー) が行うため、
  // ここでは生の actionConfig bag を載せるだけ
  const actionHost: BoxBotActionBaseHost = {
    actionConfig,
    applyArmAngle: (rad) => writeArmAngle(arm.leftRef, arm.rightRef, rad),
    applyArmLift: (lift) =>
      writeArmLift(arm.leftRef, arm.rightRef, lift.left, lift.right),
    applyLegBob: (offsets) =>
      writeLegBob(
        leg.leftRef,
        leg.rightRef,
        layout.leg.y,
        offsets.left,
        offsets.right,
      ),
    applyLegSwing: (angles) =>
      writeLegSwing(leg.leftRef, leg.rightRef, angles.left, angles.right),
    applyShadowLift: (y) => writeShadowLift(shadowLiftRef, y),
    applyShift: (offset) => writeShift(displayAreaRef, offset),
    applySquash: (sx, sy) => writeSquash(rootRef, sx, sy),
    applyTiltAngle: (rad) => writeTilt(fallPivotRef, rad),
    applyYawDelta: (rad) => writeYawDelta(yawRef, rad),
    eventTarget,
    interactive,
    readFacing: () => readFacing(yawRef, rotationY),
    readPosture: () => readPosture(postureRef),
    reportPosture: (phase) => writePosture(postureRef, phase),
  }

  // Context 経由で注入されたアクションを実行。配列順 = useFrame 実行順。
  for (const action of actions) action.use(actionHost)

  return {
    arm,
    cfg,
    createClickEmitter,
    fallPivotRef,
    hover,
    interactive,
    layout,
    leg,
    onClick,
    rootRef,
    rotationY,
    walkingBobRef,
    yawRef,
  }
}
