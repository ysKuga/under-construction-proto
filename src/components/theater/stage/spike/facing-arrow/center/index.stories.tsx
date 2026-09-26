import { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useRef } from 'react'

import { Button } from '@/components/ui/button'

import { FacingArrowCenter as StoryComponent } from '.'

const meta: Meta<typeof StoryComponent> = {
  component: StoryComponent,
}

export default meta
type Story = StoryObj<typeof StoryComponent>

/** hex の隣接6方向(deg、0 = 右、時計回り) */
const HEX_DIRECTIONS_DEG = [30, 90, 150, 210, 270, 330]

/**
 * 向き切替の確認
 *
 * - ボタンで hex の隣接6方向へ向きを切り替える(ref 先へ rotate を直書き)
 */
export const Default: Story = {
  render: function Render() {
    const facingRef = useRef<HTMLDivElement>(null)

    return (
      <div className="flex flex-col items-start gap-4">
        <StoryComponent ref={facingRef} />
        <div className="flex gap-2">
          {HEX_DIRECTIONS_DEG.map((deg) => (
            <Button
              key={deg}
              onClick={() => {
                if (!facingRef.current) return

                facingRef.current.style.transform = `rotate(${deg}deg)`
              }}
            >
              {deg}°
            </Button>
          ))}
        </div>
      </div>
    )
  },
}
