import { Meta, StoryObj } from '@storybook/nextjs-vite'

import { StyledDiv } from '@/components/samples/_parts/_base/part-base'

import { BoxBot as StoryComponent } from '.'

const meta: Meta<typeof StoryComponent> = {
  component: StoryComponent,
}

export default meta
type Story = StoryObj<typeof StoryComponent>

export const Mode2D: Story = {
  args: {
    mode: '2d',
  },
}

export const Mode3D: Story = {
  args: {
    mode: '3d',
  },
}

/** 3D、回転停止 */
export const Static: Story = {
  args: {
    autoRotate: false,
    interactive: false,
    mode: '3d',
    orbit: false,
  },
}

/** 3D、回転速度を変更 */
export const SlowRotate: Story = {
  args: {
    mode: '3d',
    rotateSpeed: 0.15,
  },
}

/** style 経由でサイズ変更 */
export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16 }}>
      <StoryComponent mode="3d" style={{ height: 320, width: 320 }} />
      <StoryComponent mode="3d" style={{ height: 200, width: 200 }} />
      <StoryComponent mode="3d" style={{ height: 120, width: 120 }} />
    </div>
  ),
}

/** 升目表示との組み合わせ */
export const Grid: Story = {
  render: () => {
    const cols = 5
    const rows = 3
    const cellSize = 72

    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
        }}
      >
        {Array.from({ length: cols * rows }).map((_, i) => (
          <StyledDiv key={i} style={{ position: 'relative' }}>
            {i === Math.floor((cols * rows) / 2) && (
              <StoryComponent
                mode="2d"
                style={{
                  height: cellSize,
                  position: 'absolute',
                  width: cellSize,
                }}
              />
            )}
          </StyledDiv>
        ))}
      </div>
    )
  },
}

/** 升目表示との組み合わせ(3D) */
export const Grid3D: Story = {
  render: () => {
    const cols = 5
    const rows = 3
    const cellSize = 96

    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
        }}
      >
        {Array.from({ length: cols * rows }).map((_, i) => (
          <StyledDiv key={i} style={{ position: 'relative' }}>
            {i === Math.floor((cols * rows) / 2) && (
              <StoryComponent
                mode="3d"
                orbit={false}
                style={{
                  height: cellSize,
                  position: 'absolute',
                  width: cellSize,
                }}
              />
            )}
          </StyledDiv>
        ))}
      </div>
    )
  },
}

/** 表示領域を円形にクリップ(style.borderRadius + overflow) */
export const Circle: Story = {
  args: {
    background: '#ffffff',
    mode: '3d',
    style: {
      borderRadius: '50%',
      height: 240,
      overflow: 'hidden',
      width: 240,
    },
  },
}
