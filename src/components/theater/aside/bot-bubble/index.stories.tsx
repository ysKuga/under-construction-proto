import { Meta, StoryObj } from '@storybook/nextjs-vite'

import { BotBubble as StoryComponent } from '.'

/** 仮の操作。story では吹き出しの操作を接続しない */
const noop = () => {}

const meta: Meta<typeof StoryComponent> = {
  component: StoryComponent,
  decorators: [
    (Story) => (
      // 吹き出しは基準点からの offset で absolute 配置されるため、基準点を中央へ置く
      <div style={{ height: 160, position: 'relative', width: 240 }}>
        <div style={{ left: 80, position: 'absolute', top: 120 }}>
          <Story />
        </div>
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof StoryComponent>

export const Default: Story = {
  args: {
    ariaLabel: '経路に沿って自動移動を開始',
    offset: { x: 20, y: -36 },
    onClick: noop,
    speechText: '実行！',
    thoughtText: '実行？',
    visible: true,
  },
}

/** close ボタン(×)付き */
export const Closable: Story = {
  args: {
    ...Default.args,
    closeAriaLabel: '目標設定をキャンセル',
    onClose: noop,
  },
}
