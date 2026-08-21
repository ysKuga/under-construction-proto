'use client'

import { Ink } from './_components/ink'
import { SketchBox } from './_components/sketch-box'
import { BoxBotEventProvider } from './index.contexts'
import { useBoxBotModel } from './index.hooks'
import type { BoxBotModelProps } from './index.types'

export function BoxBotModel({ eventTarget, ...props }: BoxBotModelProps) {
  return (
    <BoxBotEventProvider eventTarget={eventTarget}>
      <BoxBotModelInner {...props} />
    </BoxBotEventProvider>
  )
}

function BoxBotModelInner(props: Omit<BoxBotModelProps, 'eventTarget'>) {
  const {
    cfg,
    headFront,
    headY,
    hover,
    interactive,
    leftArm,
    legX,
    legY,
    rightArm,
    root,
    shoulderX,
    shoulderY,
    spin,
    startHop,
    toggleLeft,
    toggleRight,
  } = useBoxBotModel(props)

  return (
    <group ref={root}>
      <group ref={spin}>
        <SketchBox
          cfg={cfg}
          handlers={{ onClick: startHop, ...hover }}
          position={[0, 0, 0]}
          seed={cfg.seed + 1}
          size={[cfg.body.w, cfg.body.h, cfg.body.d]}
        />
        <SketchBox
          cfg={cfg}
          handlers={{ onClick: startHop, ...hover }}
          position={[0, headY, 0]}
          seed={cfg.seed + 2}
          size={[cfg.head.w, cfg.head.h, cfg.head.d]}
        />

        {/* 腕(肩を支点に回転。クリックで上げ下げ) */}
        <group
          position={[-shoulderX, shoulderY, 0]}
          ref={leftArm}
          {...(interactive ? { onClick: toggleLeft, ...hover } : {})}
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
          ref={rightArm}
          {...(interactive ? { onClick: toggleRight, ...hover } : {})}
        >
          <SketchBox
            cfg={cfg}
            position={[0, -cfg.arm.rightLen / 2, 0]}
            seed={cfg.seed + 4}
            size={[cfg.arm.w, cfg.arm.rightLen, cfg.arm.d]}
          />
        </group>

        {/* 脚 */}
        <SketchBox
          cfg={cfg}
          position={[-legX, legY, 0]}
          seed={cfg.seed + 5}
          size={[cfg.leg.w, cfg.leg.h, cfg.leg.d]}
        />
        <SketchBox
          cfg={cfg}
          position={[legX, legY, 0]}
          seed={cfg.seed + 6}
          size={[cfg.leg.w, cfg.leg.h, cfg.leg.d]}
        />

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
    </group>
  )
}
