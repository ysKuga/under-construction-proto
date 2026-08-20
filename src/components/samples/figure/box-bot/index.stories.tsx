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

/**
 * three(WebGL) 実装同士が重なり合った場合の見え方を確認
 *
 * 各セルから微妙にオフセットして配置し、隣接する Canvas が重なるようにする。
 * zIndex で重なり順を明示。
 */
export const OverlapGrid3D: Story = {
  render: () => {
    const cols = 3
    const rows = 2
    const cellSize = 120
    // セル中心からのオフセット(px)。重なりを発生させる
    const offsets: [number, number][] = [
      [0, 0],
      [22, -16],
      [-18, 14],
      [16, 18],
      [-22, -12],
      [20, 8],
    ]

    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
        }}
      >
        {Array.from({ length: cols * rows }).map((_, i) => {
          const [dx, dy] = offsets[i] ?? [0, 0]

          return (
            <StyledDiv key={i} style={{ position: 'relative' }}>
              <StoryComponent
                mode="3d"
                orbit={false}
                style={{
                  height: cellSize,
                  left: dx,
                  position: 'absolute',
                  top: dy,
                  width: cellSize,
                  zIndex: i,
                }}
              />
            </StyledDiv>
          )
        })}
      </div>
    )
  },
}

/** 基準 fov(deg)。円と Canvas のサイズが等しい(拡大なし)ときの値 */
const CIRCLE_BASE_FOV = 34

/**
 * Canvas サイズの拡大率ぶん fov を広げ、本体の見かけの大きさを一定に保つ
 *
 * fov 固定のまま Canvas を拡大すると、同じ world サイズの本体がより多くの
 * ピクセルで描画され、本体自体が大きく見えてしまう。拡大率に応じて画角を
 * 広げることで、表示範囲(はみ出しの許容量)だけを広げる。
 */
const fovForScale = (baseSize: number, canvasSize: number) =>
  (2 *
    Math.atan(
      Math.tan((CIRCLE_BASE_FOV * Math.PI) / 360) * (canvasSize / baseSize),
    ) *
    180) /
  Math.PI

/**
 * 円形の背景の上に本体を重ねて表示
 *
 * Canvas は 1 枚のラスタのため、border-radius + overflow:hidden で
 * クリップすると本体も影も一律に切り取られる。ここでは円形の背景 div と、\
 * クリップしない一回り大きい Canvas を重ね、本体が円の外へはみ出せるようにする。
 * canvasSize (Canvas の一辺) は控え目にすると見切れの原因になるため、
 * args から調整可能にしておく。本体の見かけの大きさが変わらないよう、
 * 拡大率に応じて fov も合わせて調整する。
 */
export const Circle: StoryObj<{ canvasSize?: number }> = {
  args: {
    canvasSize: 360,
  },
  argTypes: {
    canvasSize: {
      control: { max: 800, min: 240, step: 20, type: 'range' },
    },
  },
  render: (args) => {
    const circleSize = 240
    const canvasSize = args.canvasSize ?? 360
    const padding = (canvasSize - circleSize) / 2

    return (
      <div style={{ padding }}>
        <div
          style={{
            height: circleSize,
            position: 'relative',
            width: circleSize,
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '50%',
              inset: 0,
              position: 'absolute',
            }}
          />
          <StoryComponent
            fov={fovForScale(circleSize, canvasSize)}
            mode="3d"
            shadowScale={2.5}
            style={{
              height: canvasSize,
              left: '50%',
              position: 'absolute',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              width: canvasSize,
            }}
          />
        </div>
      </div>
    )
  },
}
