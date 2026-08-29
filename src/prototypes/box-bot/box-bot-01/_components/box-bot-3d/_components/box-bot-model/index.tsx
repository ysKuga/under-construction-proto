'use client'

import { Ink } from './_components/ink'
import { SketchBox } from './_components/sketch-box'
import { ON_CLICK_BODY, ON_CLICK_HEAD } from './index.constants'
import { BoxBotEventProvider, BoxBotRefsProvider } from './index.contexts'
import { useBoxBotModel } from './index.hooks'
import type { BoxBotModelProps } from './index.types'

export function BoxBotModel({ eventTarget, ...props }: BoxBotModelProps) {
  return (
    <BoxBotEventProvider eventTarget={eventTarget}>
      <BoxBotRefsProvider>
        <BoxBotModelInner {...props} />
      </BoxBotRefsProvider>
    </BoxBotEventProvider>
  )
}

function BoxBotModelInner(props: Omit<BoxBotModelProps, 'eventTarget'>) {
  const {
    cfg,
    createClickEmitter,
    headFront,
    headY,
    hover,
    legX,
    legY,
    onClick,
    rootRef,
    rotationY,
    shoulderX,
    shoulderY,
  } = useBoxBotModel(props)

  // 部位ごとに要素イベントを割り当てる。ON_CLICK_BODY / ON_CLICK_HEAD を差し替えれば
  // その部位の押下で発行されるイベントが変わる
  const onPointerDownBody = createClickEmitter(ON_CLICK_BODY)
  const onPointerDownHead = createClickEmitter(ON_CLICK_HEAD)

  return (
    // rootRef: jump の squash(scale)対象。初期姿勢の y 回転もここへ
    <group ref={rootRef} rotation={[0, rotationY, 0]}>
      <SketchBox
        cfg={cfg}
        handlers={{
          ...hover,
          onClick: (e) => {
            e.stopPropagation()
            onClick?.()
          },
          onPointerDown: onPointerDownBody,
        }}
        position={[0, 0, 0]}
        seed={cfg.seed + 1}
        size={[cfg.body.w, cfg.body.h, cfg.body.d]}
      />
      <SketchBox
        cfg={cfg}
        handlers={{
          ...hover,
          onClick: (e) => {
            e.stopPropagation()
            onClick?.()
          },
          onPointerDown: onPointerDownHead,
        }}
        position={[0, headY, 0]}
        seed={cfg.seed + 2}
        size={[cfg.head.w, cfg.head.h, cfg.head.d]}
      />

      {/* 腕(静的。肩を支点に leftAngle / rightAngle だけ傾ける) */}
      <group
        position={[-shoulderX, shoulderY, 0]}
        rotation={[0, 0, cfg.arm.leftAngle]}
      >
        <SketchBox
          cfg={cfg}
          position={[0, -cfg.arm.leftLen / 2, 0]}
          seed={cfg.seed + 3}
          size={[cfg.arm.w, cfg.arm.leftLen, cfg.arm.d]}
        />
      </group>
      <group
        position={[shoulderX, shoulderY, 0]}
        rotation={[0, 0, cfg.arm.rightAngle]}
      >
        <SketchBox
          cfg={cfg}
          position={[0, -cfg.arm.rightLen / 2, 0]}
          seed={cfg.seed + 4}
          size={[cfg.arm.w, cfg.arm.rightLen, cfg.arm.d]}
        />
      </group>

      {/* 脚(静的) */}
      <group position={[-legX, legY, 0]}>
        <SketchBox
          cfg={cfg}
          position={[0, -cfg.leg.h / 2, 0]}
          seed={cfg.seed + 5}
          size={[cfg.leg.w, cfg.leg.h, cfg.leg.d]}
        />
      </group>
      <group position={[legX, legY, 0]}>
        <SketchBox
          cfg={cfg}
          position={[0, -cfg.leg.h / 2, 0]}
          seed={cfg.seed + 6}
          size={[cfg.leg.w, cfg.leg.h, cfg.leg.d]}
        />
      </group>

      {/* 顔 */}
      <Ink
        cfg={cfg}
        position={[-cfg.eye.offset, headY + 0.05, headFront]}
        size={[cfg.eye.w, cfg.eye.h, cfg.eye.d]}
      />
      <Ink
        cfg={cfg}
        position={[cfg.eye.offset, headY + 0.05, headFront]}
        size={[cfg.eye.w, cfg.eye.h, cfg.eye.d]}
      />
      <Ink
        cfg={cfg}
        position={[0, headY - 0.22, headFront]}
        size={[0.55, 0.055, 0.06]}
      />
    </group>
  )
}
