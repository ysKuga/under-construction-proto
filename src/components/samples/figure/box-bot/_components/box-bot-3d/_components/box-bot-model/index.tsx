'use client'

import { Ink } from './_components/ink'
import { SketchBox } from './_components/sketch-box'
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
    arm,
    cfg,
    clickBody,
    clickHead,
    fallPivotRef,
    groundY,
    headFront,
    headY,
    hover,
    leftArmRef,
    leftLegRef,
    legX,
    legY,
    rightArmRef,
    rightLegRef,
    rootRef,
    shoulderX,
    shoulderY,
    spinRef,
    walkingBobRef,
  } = useBoxBotModel(props)

  return (
    <group ref={rootRef}>
      {/* 接地点(脚の下端)へ移動 → fallPivotRef で回転 → 元のローカル座標へ戻す。
          回転中心を体の中心でなく接地点にするための pivot */}
      <group position={[0, groundY, 0]}>
        <group ref={fallPivotRef}>
          <group position={[0, -groundY, 0]}>
            <group ref={spinRef}>
              <group ref={walkingBobRef}>
                <SketchBox
                  cfg={cfg}
                  handlers={{ onClick: clickBody, ...hover }}
                  position={[0, 0, 0]}
                  seed={cfg.seed + 1}
                  size={[cfg.body.w, cfg.body.h, cfg.body.d]}
                />
                <SketchBox
                  cfg={cfg}
                  handlers={{ onClick: clickHead, ...hover }}
                  position={[0, headY, 0]}
                  seed={cfg.seed + 2}
                  size={[cfg.head.w, cfg.head.h, cfg.head.d]}
                />

                {/* 腕(肩を支点に回転。クリックで上げ下げ) */}
                <group
                  onClick={arm.left.toggle}
                  position={[-shoulderX, shoulderY, 0]}
                  ref={leftArmRef}
                  {...hover}
                >
                  <SketchBox
                    cfg={cfg}
                    position={[0, -cfg.arm.leftLen / 2, 0]}
                    seed={cfg.seed + 3}
                    size={[cfg.arm.w, cfg.arm.leftLen, cfg.arm.d]}
                  />
                </group>
                <group
                  onClick={arm.right.toggle}
                  position={[shoulderX, shoulderY, 0]}
                  ref={rightArmRef}
                  {...hover}
                >
                  <SketchBox
                    cfg={cfg}
                    position={[0, -cfg.arm.rightLen / 2, 0]}
                    seed={cfg.seed + 4}
                    size={[cfg.arm.w, cfg.arm.rightLen, cfg.arm.d]}
                  />
                </group>

                {/* 脚(付け根を支点。歩行時は bob/swing で動く) */}
                <group position={[-legX, legY, 0]} ref={leftLegRef}>
                  <SketchBox
                    cfg={cfg}
                    position={[0, -cfg.leg.h / 2, 0]}
                    seed={cfg.seed + 5}
                    size={[cfg.leg.w, cfg.leg.h, cfg.leg.d]}
                  />
                </group>
                <group position={[legX, legY, 0]} ref={rightLegRef}>
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
            </group>
          </group>
        </group>
      </group>
    </group>
  )
}
