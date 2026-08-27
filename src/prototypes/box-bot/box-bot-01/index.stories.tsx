import { Meta, StoryObj } from '@storybook/nextjs-vite'
import * as React from 'react'

import { Button } from '@/components/ui/button'

import { LEG_CYCLE_SEC } from './_components/box-bot-3d/_components/box-bot-model/index.constants'
import type { LegStyle } from './_components/box-bot-3d/_components/box-bot-model/index.types'
import { useBoxBotActionDispatcher } from './_components/box-bot-3d/_components/box-bot-model/use-box-bot-action-dispatcher'

import { BoxBot01 as StoryComponent } from '.'

const meta: Meta<typeof StoryComponent> = {
  args: {
    // 表示領域の上下移動の確認では影が邪魔になるため消す
    shadowOpacity: 0,
    // 設置領域(Assembly)の枠。ジャンプ時に表示領域(Canvas)が設置領域を
    // 上方向へ逸脱する様子を確認するため
    style: { outline: '1px solid red' },
  },
  component: StoryComponent,
}

export default meta
type Story = StoryObj<typeof StoryComponent>

export const Default: Story = {}

/** 回転停止・非インタラクティブ */
export const Static: Story = {
  args: {
    autoRotate: false,
    interactive: false,
    orbit: false,
  },
}

/** 回転速度を変更 */
export const SlowRotate: Story = {
  args: {
    rotateSpeed: 0.15,
  },
}

type WalkingArgs = {
  /** body 全体の bobbing を有効にするか */
  bodyBobbing?: boolean
}

/**
 * walking(脚 swing)・marching(脚 bob)action の挙動確認
 *
 * - 歩く/止まるボタン + 歩き方(swing/bob)の切替 + 速度スライダーを画面内に直接配置する
 * - マウント時に自動で歩き始める(`autoWalk` props で Canvas 内部から直接 ref をセット)
 * - 歩行中に legStyle を切り替えると、その場で旧方式を止めて新方式を開始する
 */
export const Walking: StoryObj<WalkingArgs> = {
  args: {
    bodyBobbing: true,
  },
  argTypes: {
    bodyBobbing: { control: 'boolean' },
  },
  render: (args) => {
    const [eventTarget] = React.useState(() => new EventTarget())
    const { marchingToggle, walkingToggle } =
      useBoxBotActionDispatcher(eventTarget)
    const [walking, setWalking] = React.useState(true)
    const [legStyle, setLegStyle] = React.useState<LegStyle>('swing')
    const [legCycle, setLegCycle] = React.useState(LEG_CYCLE_SEC)
    const legStyleRef = React.useRef(legStyle)

    const toggleByStyle = (style: LegStyle) => {
      if (style === 'bob') void marchingToggle()
      else void walkingToggle()
    }

    // legStyle 切替。歩行中のみ、旧方式を止めて新方式を開始する(初回マウントは
    // autoWalk props に任せるため、legStyleRef の初期値と一致し何もしない)
    React.useEffect(() => {
      if (legStyleRef.current === legStyle) return
      if (walking) {
        toggleByStyle(legStyleRef.current)
        toggleByStyle(legStyle)
      }
      legStyleRef.current = legStyle
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [legStyle])

    return (
      <div>
        <div
          style={{
            alignItems: 'center',
            display: 'flex',
            gap: 12,
            position: 'relative',
            zIndex: 10,
          }}
        >
          <Button
            onClick={() => {
              toggleByStyle(legStyle)
              setWalking((v) => !v)
            }}
            type="button"
            variant="outline"
          >
            {walking ? 'Stop' : 'Walk'}
          </Button>
          <select
            onChange={(e) => setLegStyle(e.target.value as LegStyle)}
            value={legStyle}
          >
            <option value="swing">swing</option>
            <option value="bob">bob</option>
          </select>
          <label style={{ alignItems: 'center', display: 'flex', gap: 8 }}>
            speed
            <input
              max={2}
              min={0.1}
              onChange={(e) => setLegCycle(Number(e.target.value))}
              step={0.05}
              type="range"
              value={legCycle}
            />
          </label>
        </div>
        <StoryComponent
          autoWalk={legStyle}
          bodyBobbing={args.bodyBobbing}
          eventTarget={eventTarget}
          legCycle={legCycle}
          shadowOpacity={0}
          style={{ outline: '1px solid red' }}
        />
      </div>
    )
  },
}

/**
 * fall(転倒)・getUp(起き上がり)action の挙動確認
 *
 * - 直立時のみ fall が、倒れている時のみ getUp が実際に発火する(内部ガード)
 * - 設置領域(height=300)を狭めに指定。#108 で Canvas は設置領域と一致するため、\
 *   完全転倒時は下部が Canvas 外へ見切れる(fall の可動域確保は #108 フェーズ1 で別途対応)
 */
export const Fall: Story = {
  parameters: {
    options: { showPanel: false },
  },
  render: () => {
    const [eventTarget] = React.useState(() => new EventTarget())
    const { fall, getUp } = useBoxBotActionDispatcher(eventTarget)

    return (
      <div>
        <div
          style={{
            alignItems: 'center',
            display: 'flex',
            gap: 12,
            position: 'absolute',
            top: 0,
            zIndex: 10,
          }}
        >
          <Button onClick={() => void fall()} type="button" variant="outline">
            Fall
          </Button>
          <Button onClick={() => void getUp()} type="button" variant="outline">
            Get Up
          </Button>
        </div>
        <StoryComponent
          eventTarget={eventTarget}
          shadowOpacity={0}
          style={{
            height: 300,
            marginLeft: 100,
            marginTop: 50,
            outline: '1px solid red',
          }}
        />
      </div>
    )
  },
}

/**
 * jump action の挙動・パラメータ調節
 *
 * - Jump ボタンで単発ジャンプ。スライダーで持ち上げ量(px)・継続時間(秒)を変え、\
 *   dispatch の override 引数(`jump({ liftPx, durSec })`)として渡す
 * - #108: 縦移動は表示領域(Canvas)ごと。設置領域(赤枠)を上へ飛び出す
 */
export const Jump: Story = {
  parameters: {
    options: { showPanel: false },
  },
  render: () => {
    const [eventTarget] = React.useState(() => new EventTarget())
    const { jump } = useBoxBotActionDispatcher(eventTarget)
    const [liftPx, setLiftPx] = React.useState(130)
    const [durSec, setDurSec] = React.useState(0.55)

    return (
      <div>
        <div
          style={{
            alignItems: 'center',
            display: 'flex',
            gap: 12,
            position: 'relative',
            zIndex: 10,
          }}
        >
          <Button
            onClick={() => void jump({ durSec, liftPx })}
            type="button"
            variant="outline"
          >
            Jump
          </Button>
          <label style={{ alignItems: 'center', display: 'flex', gap: 8 }}>
            lift {liftPx}px
            <input
              max={400}
              min={0}
              onChange={(e) => setLiftPx(Number(e.target.value))}
              step={10}
              type="range"
              value={liftPx}
            />
          </label>
          <label style={{ alignItems: 'center', display: 'flex', gap: 8 }}>
            dur {durSec.toFixed(2)}s
            <input
              max={2}
              min={0.2}
              onChange={(e) => setDurSec(Number(e.target.value))}
              step={0.05}
              type="range"
              value={durSec}
            />
          </label>
        </div>
        <StoryComponent
          eventTarget={eventTarget}
          shadowOpacity={0}
          style={{ marginTop: 160, outline: '1px solid red' }}
        />
      </div>
    )
  },
}
