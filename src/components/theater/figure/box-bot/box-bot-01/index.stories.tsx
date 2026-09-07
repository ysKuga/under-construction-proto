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

type SizingArgs = {
  /** style.height/width に渡す px(設置領域 = 表示領域のサイズ) */
  size: number
}

/** Sizing の基準セル一辺(px) */
const SIZING_CELL = 96

/**
 * size(style.height)を可変にして、設置領域(= 表示領域)と基準セルの関係を見る
 *
 * - #108 で表示領域 = 設置領域。赤 outline(= 設置領域)がそのまま Canvas の外周で、
 *   samples 版のように Canvas が一回り大きくならない
 * - ただし fov 自動算出は bot の見かけ px を一定に保つ較正(≈ DEFAULT_HEIGHT 234)。
 *   size をそれより小さくすると bot は縮小せず Canvas にクリップされる。
 *   小さいセルへ載せる用途では明示 `fov` か別の縮小手段が要る(box-bot-01 の
 *   「拡大縮小の禁止」方針。README 参照)
 * - `orbit={false}` / `actions={[]}` で静止。灰マス = 96px の基準セル
 */
export const Sizing: StoryObj<SizingArgs> = {
  args: {
    size: SIZING_CELL,
  },
  argTypes: {
    size: { control: { max: 320, min: 32, step: 8, type: 'range' } },
  },
  render: (args) => (
    <div style={{ padding: 160 }}>
      <div
        style={{
          alignItems: 'center',
          display: 'flex',
          height: SIZING_CELL,
          justifyContent: 'center',
          outline: '1px solid #cbd5e1',
          width: SIZING_CELL,
        }}
      >
        <StoryComponent
          actions={[]}
          orbit={false}
          shadowOpacity={0}
          style={{
            height: args.size,
            outline: '1px solid red',
            width: args.size,
          }}
        />
      </div>
    </div>
  ),
}
