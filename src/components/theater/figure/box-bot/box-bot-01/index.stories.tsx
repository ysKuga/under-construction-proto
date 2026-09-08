import { Meta, StoryObj } from '@storybook/nextjs-vite'

import StoryComponent from '.'

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

/**
 * 胴クリックでジャンプ / 頭クリックでスピン(既定の clickBindings)
 *
 * - action ごとの挙動確認は `_actions/<name>/index.stories.tsx` を参照
 */
export const Default: Story = {}

/**
 * `canvasWidth` / `canvasHeight` で表示領域(Canvas)だけ広げる
 *
 * - 設置領域(赤枠)は正方形のまま。表示領域はその中心を基準に横 / 縦へ逸脱して広がる
 * - bot の見かけの大きさは不変(`canvasHeight` は fov 側で補正)。見える範囲だけ増える
 * - `canvasHeight` は拡大表示でジャンプしても頭が切れないよう縦の可動域を足す用途
 * - 隣接要素と衝突しない文脈向けの opt-in(#108 の「表示領域 = 設置領域」原則の緩和)
 */
export const FullWidth: Story = {
  args: {
    canvasHeight: 640,
    canvasWidth: '100vw',
  },
  render: (args) => (
    <div
      style={{
        alignItems: 'center',
        display: 'flex',
        height: '100vh',
        justifyContent: 'center',
        overflowX: 'clip',
      }}
    >
      <StoryComponent {...args} />
    </div>
  ),
}

/**
 * `actionConfig` prop で jump の既定値を上書き
 *
 * - dispatch の 1 回上書き(`jump({...})`)ではなく props で既定を差し替える。\
 *   クリック起点・hopping にも効く
 * - `BoxBot3DConfig` に jump フィールドは無く、値は `_actions/jump` の descriptor が持つ(残る結合 A)
 */
export const ConfigOverride: Story = {
  args: {
    actionConfig: { jump: { durSec: 0.8, liftPx: 260 } },
  },
}

/** 大中小のサイズ(style.height/width の px)。大 = DEFAULT_HEIGHT の較正サイズ */
const SIZE_VARIANTS = [
  { label: '極小', size: 44 },
  { label: '小', size: 88 },
  { label: '中', size: 144 },
  { label: '大', size: 234 },
] as const

/**
 * `style.height` の大中小バリエーション
 *
 * - #108 で表示領域 = 設置領域。赤 outline(= 設置領域)がそのまま Canvas の外周で、
 *   samples 版のように Canvas が一回り大きくならない
 * - overscan=1(表示領域 = 設置領域)では fov 固定のため、size に比例して bot も
 *   拡大縮小する。小さいセルへも `style.height` だけで載る
 * - `orbit={false}` / `actions={[]}` で静止
 */
export const Sizes: Story = {
  render: () => (
    <div style={{ alignItems: 'flex-end', display: 'flex', gap: 24 }}>
      {SIZE_VARIANTS.map(({ label, size }) => (
        <figure key={label} style={{ margin: 0 }}>
          <StoryComponent
            actions={[]}
            orbit={false}
            shadowOpacity={0}
            style={{
              height: size,
              outline: '1px solid red',
              width: size,
            }}
          />
          <figcaption style={{ fontSize: 12, textAlign: 'center' }}>
            {label} ({size}px)
          </figcaption>
        </figure>
      ))}
    </div>
  ),
}
