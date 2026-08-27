'use client'

import * as React from 'react'

import { useEventDispatcher } from '@/hooks/event'

import { useArmAction } from './_action-hooks/arm-action'
import { useMarchingAction, useWalkingAction } from './_action-hooks/leg-action'
import { useAutoRotateAction } from './_action-hooks/use-auto-rotate-action'
import { useBodyBobbingAction } from './_action-hooks/use-body-bobbing-action'
import { useFallAction } from './_action-hooks/use-fall-action'
import { useGetUpAction } from './_action-hooks/use-get-up-action'
import { useHoppingAction } from './_action-hooks/use-hopping-action'
import { useSpinAction } from './_action-hooks/use-spin-action'
import { BOX_BOT_ACTIONS, type BoxBotActionContext } from './_actions'
import { useClickActions } from './_hooks/use-click-actions'
import {
  ACTION_SPIN_STOP,
  DEFAULTS,
  HEAD_FRONT_MARGIN,
  HEAD_GAP,
  SHOULDER_Y_OFFSET,
} from './index.constants'
import { useBoxBotEventTarget, useBoxBotRefs } from './index.contexts'
import type {
  BoxBot3DConfig,
  BoxBotModelProps,
  Handlers,
  UseBoxBotModelReturn,
} from './index.types'

/** BoxBotModel のロジック(設定マージ・ref・アニメーション制御) */
export function useBoxBotModel(
  props: Omit<BoxBotModelProps, 'eventTarget'>,
): UseBoxBotModelReturn {
  const {
    autoWalk,
    hopping,
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
    jump: { ...DEFAULTS.jump, ...opts.jump },
    leg: { ...DEFAULTS.leg, ...opts.leg },
  }

  const refs = useBoxBotRefs()
  const {
    botHoverRef,
    fallPivotRef,
    hoppingRef,
    leftArmRef,
    leftLegRef,
    postureRef,
    rightArmRef,
    rightLegRef,
    rootRef,
    spinRef,
    walkingBobRef,
  } = refs

  const bodyTop = cfg.body.h / 2
  const legY = -bodyTop
  const groundY = legY - cfg.leg.h

  const eventTarget = useBoxBotEventTarget()
  const dispatch = useEventDispatcher(eventTarget)

  const setCursor = (v: string) => {
    if (typeof document !== 'undefined') document.body.style.cursor = v
  }
  const hover: Handlers = interactive
    ? {
        onPointerDown: (e) => {
          e.stopPropagation()
          botHoverRef.current = true
        },
        onPointerOut: () => {
          void dispatch(ACTION_SPIN_STOP)
          setCursor('auto')
          botHoverRef.current = false
        },
        onPointerOver: (e) => {
          e.stopPropagation()
          setCursor('pointer')
          botHoverRef.current = true
        },
        onPointerUp: () => {
          botHoverRef.current = false
        },
      }
    : {}

  // レジストリ化済みアクション(現状 jump のみ)。配列順 = useFrame 実行順。
  // 追加/削除は _actions/index.ts の BOX_BOT_ACTIONS だけで完結する
  const actionContext: BoxBotActionContext = {
    cfg,
    displayAreaRef: props.displayAreaRef,
    eventTarget,
    props,
    refs,
  }
  for (const action of BOX_BOT_ACTIONS) action.use(actionContext)

  useSpinAction(props)
  useHoppingAction(props, cfg)
  const {
    clickArmLeft,
    clickArmRight,
    clickBody,
    clickHead,
    releaseBody,
    releaseHead,
  } = useClickActions(props)
  const { startFall } = useFallAction(props)
  const { startGetUp } = useGetUpAction(props)
  const { arm } = useArmAction(props, cfg)
  useAutoRotateAction(props)
  const { walkingRef } = useWalkingAction(props)
  const { marchingRef } = useMarchingAction(props, legY)
  useBodyBobbingAction(props, legY)

  // マウント時に autoWalk の歩き方で歩き始める・hopping を開始する。
  // useBoxBotActionDispatcher 経由の toggle は Canvas 外部からの発行になり、
  // 初回マウント直後は listener 登録前にイベントが発行されるタイミング競合の
  // 余地があるため、ref を直接セットする
  React.useLayoutEffect(() => {
    if (autoWalk === 'swing') walkingRef.current = true
    else if (autoWalk === 'bob') marchingRef.current = true
    if (hopping) hoppingRef.current = true
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const headY = bodyTop + HEAD_GAP + cfg.head.h / 2
  const headFront = cfg.head.d / 2 + HEAD_FRONT_MARGIN
  const shoulderY = bodyTop - SHOULDER_Y_OFFSET
  const shoulderX = cfg.body.w / 2
  const legX = (cfg.body.w / 2) * cfg.leg.gap

  return {
    arm,
    cfg,
    clickArmLeft,
    clickArmRight,
    clickBody,
    clickHead,
    fallPivotRef,
    groundY,
    headFront,
    headY,
    hover,
    interactive,
    leftArmRef,
    leftLegRef,
    legX,
    legY,
    marchingRef,
    onClick,
    postureRef,
    releaseBody,
    releaseHead,
    rightArmRef,
    rightLegRef,
    rootRef,
    rotationY,
    shoulderX,
    shoulderY,
    spinRef,
    startFall,
    startGetUp,
    walkingBobRef,
    walkingRef,
  }
}
