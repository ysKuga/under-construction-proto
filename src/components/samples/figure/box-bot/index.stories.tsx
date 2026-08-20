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

/**
 * 基準 fov(deg)
 *
 * - BoxBot3D デフォルトと同じ値
 */
const BASE_FOV = 34

/**
 * Canvas 拡大率ぶん fov を広げ、本体の見かけの大きさを一定に保つ
 *
 * - fov 固定のまま Canvas を拡大すると、同じ world サイズの本体がより多くのピクセルで描画され、本体自体が大きく見えてしまう。拡大率に応じて画角を広げることで、表示範囲(はみ出しの許容量)だけを広げる
 */
const fovForScale = (baseSize: number, canvasSize: number) =>
  (2 *
    Math.atan(Math.tan((BASE_FOV * Math.PI) / 360) * (canvasSize / baseSize)) *
    180) /
  Math.PI

/**
 * 升目表示との組み合わせ(3D)
 *
 * - ジャンプ演出(頭部が上昇)で頭が Canvas 上端を超えないよう、Canvas 自体はセルよりも一回り大きく確保し、fov で本体の見かけの大きさを維持する
 */
export const Grid3D: Story = {
  render: () => {
    const cols = 5
    const rows = 3
    const cellSize = 96
    const canvasSize = cellSize * 2.8

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
                fov={fovForScale(cellSize, canvasSize)}
                mode="3d"
                orbit={false}
                style={{
                  height: canvasSize,
                  left: '50%',
                  position: 'absolute',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: canvasSize,
                  zIndex: 1,
                }}
              />
            )}
          </StyledDiv>
        ))}
      </div>
    )
  },
}

// cellSize = 120 のとき、腕含む本体シルエットの実測サイズ(px)
const BODY_WIDTH_AT_120 = 83
const BODY_HEIGHT_AT_120 = 108
/** 隣接ペアの重なり量(本体サイズに対する比率) */
const OVERLAP_RATIO = 0.25

/** 中心間距離が size*(1-OVERLAP_RATIO) になるよう、セル index 1 つぶんの寄せ量を返す */
const overlapOffsetPerIndex = (bodySize: number, cellSize: number) =>
  bodySize * (1 - OVERLAP_RATIO) - cellSize

/**
 * three(WebGL) 実装同士が重なり合った場合の見え方を確認
 *
 * - 本体の 1/4 ほどが隣とだけ重なるよう、セル間隔を本体サイズ基準まで詰める(セル index に比例したオフセットの累積で表現)。縦横で本体の幅・高さが異なるため、それぞれ別に計算する。zIndex で重なり順を明示
 * - Canvas 同士が重なると、上の Canvas が透明部分もヒットテストを奪うため下側の本体はクリックできない(WebGL 描画は DOM 上ただの矩形として扱われ、透明ピクセルを判定してクリックを下へ透過させる標準機構がない)。ここでは表示確認が目的のため interactive を無効にしている
 */
export const OverlapGrid3D: Story = {
  render: () => {
    const cols = 3
    const rows = 2
    const cellSize = 120

    const offsetPerCol = overlapOffsetPerIndex(BODY_WIDTH_AT_120, cellSize)
    const offsetPerRow = overlapOffsetPerIndex(BODY_HEIGHT_AT_120, cellSize)

    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
        }}
      >
        {Array.from({ length: cols * rows }).map((_, i) => {
          const col = i % cols
          const row = Math.floor(i / cols)
          const dx = col * offsetPerCol
          const dy = row * offsetPerRow

          return (
            <StyledDiv key={i} style={{ position: 'relative' }}>
              <StoryComponent
                interactive={false}
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

/**
 * 円形の背景の上に本体を重ねて表示
 *
 * - Canvas は 1 枚のラスタのため、border-radius + overflow:hidden でクリップすると本体も影も一律に切り取られる。ここでは円形の背景 div と、クリップしない一回り大きい Canvas を重ね、本体が円の外へはみ出せるようにする
 * - canvasSize(Canvas の一辺)は控え目にすると見切れの原因になるため、args から調整可能にしておく。本体の見かけの大きさが変わらないよう、拡大率に応じて fov も合わせて調整する
 */
export const Circle: StoryObj<{
  /**
   * Canvas の一辺(px)
   *
   * - 円(240)より大きくするほどはみ出しの許容量が増える
   */
  canvasSize?: number
}> = {
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
