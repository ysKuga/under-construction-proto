'use client'

import type { ThreeEvent } from '@react-three/fiber'

import { useEventDispatcher } from '@/hooks/event'

import { BOX_BOT_ACTIONS, type BoxBotActionContext } from './_actions'
import { useClickBindings } from './_hooks/use-click-bindings'
import {
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

/** BoxBotModel のロジック(設定マージ・ジオメトリ寸法・アクション実行) */
export function useBoxBotModel(
  props: Omit<BoxBotModelProps, 'eventTarget'>,
): UseBoxBotModelReturn {
  const { interactive = true, onClick, rotationY = 0, ...opts } = props

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

  const boxBotRefs = useBoxBotRefs()
  const { rootRef } = boxBotRefs

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

  // 要素の押下 → 指定した要素イベントを発行するハンドラを作る。
  // どの要素にどのイベント名を割り当てるかは呼び出し側(部位を定義する JSX)が決める。
  // どの action へ繋ぐかは use-click-bindings 側。ここは何も知らない
  const emitClick = (eventName: string) => (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    void dispatch(new Event(eventName))
  }

  // 要素イベント → action イベントの中継(既定 + clickBindings prop 上書き)
  useClickBindings(eventTarget, props.clickBindings ?? {})

  // レジストリ化済みアクション(現状 jump のみ)。配列順 = useFrame 実行順。
  // 追加/削除は _actions/index.ts の BOX_BOT_ACTIONS だけで完結する
  const actionContext: BoxBotActionContext = {
    cfg,
    displayAreaRef: props.displayAreaRef,
    eventTarget,
    props,
    refs: boxBotRefs,
  }
  for (const action of BOX_BOT_ACTIONS) action.use(actionContext)

  const bodyTop = cfg.body.h / 2
  const legY = -bodyTop
  const headY = bodyTop + HEAD_GAP + cfg.head.h / 2
  const headFront = cfg.head.d / 2 + HEAD_FRONT_MARGIN
  const shoulderY = bodyTop - SHOULDER_Y_OFFSET
  const shoulderX = cfg.body.w / 2
  const legX = (cfg.body.w / 2) * cfg.leg.gap

  return {
    cfg,
    emitClick,
    headFront,
    headY,
    hover,
    interactive,
    legX,
    legY,
    onClick,
    rootRef,
    rotationY,
    shoulderX,
    shoulderY,
  }
}
