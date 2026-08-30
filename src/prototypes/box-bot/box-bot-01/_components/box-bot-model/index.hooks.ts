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

/** 体心 pivot グループ(`fallPivotRef`)の前傾角(`rotation.x`)を `rad` に設定する(fall) */
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

  const { fallPivotRef, leftArmRef, rightArmRef, rootRef, yawRef } =
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

  const { displayAreaRef } = props

  // アクションへ渡す操作面(adapter)。bot 内部構造(THREE.Group / 表示領域 DOM)への
  // 書き込みは module scope の write* に閉じ込め、ここでは ref オブジェクトを渡すだけ
  // にする(レンダーフェーズで .current を触らない = react-hooks/refs)。
  // config 差し込みは各 descriptor (defineAction のラッパー) が行うため、
  // ここでは生の actionConfig bag を載せるだけ
  const actionHost: BoxBotActionBaseHost = {
    actionConfig,
    applyArmAngle: (rad) => writeArmAngle(leftArmRef, rightArmRef, rad),
    applyShift: (offset) => writeShift(displayAreaRef, offset),
    applySquash: (sx, sy) => writeSquash(rootRef, sx, sy),
    applyTiltAngle: (rad) => writeTilt(fallPivotRef, rad),
    applyYawDelta: (rad) => writeYawDelta(yawRef, rad),
    eventTarget,
    interactive,
  }

  // Context 経由で注入されたアクションを実行。配列順 = useFrame 実行順。
  for (const action of actions) action.use(actionHost)

  const layout = deriveLayout(cfg)

  return {
    cfg,
    createClickEmitter,
    fallPivotRef,
    hover,
    interactive,
    layout,
    leftArmRef,
    onClick,
    rightArmRef,
    rootRef,
    rotationY,
    yawRef,
  }
}
