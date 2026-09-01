'use client'

import { Ink } from './_components/ink'
import { SketchBox } from './_components/sketch-box'
import {
  BoxBotActionsProvider,
  BoxBotEventProvider,
  BoxBotRefsProvider,
} from './index.contexts'
import { useBoxBotModel } from './index.hooks'
import type { BoxBotModelProps } from './index.types'

export function BoxBotModel({
  actions,
  clickBindings,
  eventTarget,
  ...props
}: BoxBotModelProps) {
  return (
    <BoxBotEventProvider eventTarget={eventTarget}>
      <BoxBotActionsProvider actions={actions} clickBindings={clickBindings}>
        <BoxBotRefsProvider>
          <BoxBotModelInner {...props} />
        </BoxBotRefsProvider>
      </BoxBotActionsProvider>
    </BoxBotEventProvider>
  )
}

function BoxBotModelInner(
  props: Omit<BoxBotModelProps, 'actions' | 'clickBindings' | 'eventTarget'>,
) {
  const {
    arm,
    cfg,
    createClickEmitter,
    fallPivotRef,
    hover,
    layout,
    leg,
    onClick,
    rootRef,
    rotationY,
    yawRef,
  } = useBoxBotModel(props)

  // ネストされた ref はプレーンな識別子へ展開してから JSX の ref 属性に渡す
  // (member 経由の ref アクセスは react(refs) の render 中アクセス検出に触れる)
  const { leftRef: armLeftRef, rightRef: armRightRef } = arm
  const { leftRef: legLeftRef, rightRef: legRightRef } = leg

  // 部位ごとに押下ハンドラを割り当てる。渡した ClickTarget が ON_CLICK_ELEMENT の
  // detail に載り、use-click-bindings が clickBindings で action イベントへ中継する
  const onPointerDownBody = createClickEmitter('body')
  const onPointerDownHead = createClickEmitter('head')
  const onPointerDownArmLeft = createClickEmitter('arm-left')
  const onPointerDownArmRight = createClickEmitter('arm-right')

  return (
    // yawRef: y 軸回転を累積するグループ(spin / autoRotate 等が rotation.y を += する)。
    //   回転 prop を持たせず、累積回転が再レンダーで巻き戻らないようにする
    <group ref={yawRef}>
      {/* rootRef: jump の squash(scale)対象。初期姿勢の y 回転もここへ */}
      <group ref={rootRef} rotation={[0, rotationY, 0]}>
        {/* シルエット中心(足元〜頭上端の中点)へ移動 → fallPivotRef で前傾 → 元へ戻す。
            体心でなく中点を軸に回すことで、横倒しでも bot が表示領域の中心に留まる(#108 フェーズ1)。
            「倒れ込み」の移動は表示領域の DOM ずらしで別途表現する */}
        <group position={[0, layout.center.y, 0]}>
          <group ref={fallPivotRef}>
            <group position={[0, -layout.center.y, 0]}>
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
                position={[0, layout.head.y, 0]}
                seed={cfg.seed + 2}
                size={[cfg.head.w, cfg.head.h, cfg.head.d]}
              />

              {/* 腕。外側グループで肩を支点に leftAngle / rightAngle の静的 z 傾き、
              内側の *ArmRef グループを fall が x 軸で回して頭側へ引き寄せる */}
              <group
                position={[-layout.shoulder.x, layout.shoulder.y, 0]}
                rotation={[0, 0, cfg.arm.leftAngle]}
              >
                <group ref={armLeftRef}>
                  <SketchBox
                    cfg={cfg}
                    handlers={{ ...hover, onPointerDown: onPointerDownArmLeft }}
                    position={[0, -cfg.arm.leftLen / 2, 0]}
                    seed={cfg.seed + 3}
                    size={[cfg.arm.w, cfg.arm.leftLen, cfg.arm.d]}
                  />
                </group>
              </group>
              <group
                position={[layout.shoulder.x, layout.shoulder.y, 0]}
                rotation={[0, 0, cfg.arm.rightAngle]}
              >
                <group ref={armRightRef}>
                  <SketchBox
                    cfg={cfg}
                    handlers={{
                      ...hover,
                      onPointerDown: onPointerDownArmRight,
                    }}
                    position={[0, -cfg.arm.rightLen / 2, 0]}
                    seed={cfg.seed + 4}
                    size={[cfg.arm.w, cfg.arm.rightLen, cfg.arm.d]}
                  />
                </group>
              </group>

              {/* 脚。付け根グループを walking が rotation.x、marching が position.y で動かす。
                  静止時は layout.leg.y のまま */}
              <group
                position={[-layout.leg.x, layout.leg.y, 0]}
                ref={legLeftRef}
              >
                <SketchBox
                  cfg={cfg}
                  position={[0, -cfg.leg.h / 2, 0]}
                  seed={cfg.seed + 5}
                  size={[cfg.leg.w, cfg.leg.h, cfg.leg.d]}
                />
              </group>
              <group
                position={[layout.leg.x, layout.leg.y, 0]}
                ref={legRightRef}
              >
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
                position={[
                  -cfg.eye.offset,
                  layout.head.y + 0.05,
                  layout.head.front,
                ]}
                size={[cfg.eye.w, cfg.eye.h, cfg.eye.d]}
              />
              <Ink
                cfg={cfg}
                position={[
                  cfg.eye.offset,
                  layout.head.y + 0.05,
                  layout.head.front,
                ]}
                size={[cfg.eye.w, cfg.eye.h, cfg.eye.d]}
              />
              <Ink
                cfg={cfg}
                position={[0, layout.head.y - 0.22, layout.head.front]}
                size={[0.55, 0.055, 0.06]}
              />
            </group>
          </group>
        </group>
      </group>
    </group>
  )
}
