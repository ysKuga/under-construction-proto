import { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'

import { ChoicePanel as StoryComponent } from '.'

/** 何もしない選択時 */
const noop = () => {}

const meta: Meta<typeof StoryComponent> = {
  component: StoryComponent,
}

export default meta
type Story = StoryObj<typeof StoryComponent>

/** 経路提示中の選択肢（実行・中継点・キャンセル）。選択肢があるため開いた状態で始まる */
export const Default: Story = {
  args: {
    choices: [
      { id: 'execute', label: '実行', onSelect: noop },
      { id: 'waypoint', label: '中継点', onSelect: noop, pressed: false },
      { id: 'cancel', label: 'キャンセル', onSelect: noop },
    ],
  },
}

/** 中継点の選択中。押下中の表示になる */
export const Pressed: Story = {
  args: {
    choices: [
      { id: 'execute', label: '実行', onSelect: noop },
      { id: 'waypoint', label: '中継点', onSelect: noop, pressed: true },
      { id: 'cancel', label: 'キャンセル', onSelect: noop },
    ],
  },
}

/** 選択肢なし。閉じた状態で始まり、呼び出しボタンで開くと「選択肢なし」を表示する */
export const Empty: Story = {
  args: {
    choices: [],
  },
}

/** 選択肢が多く高さを超える。パネル内を縦スクロールする */
export const Overflow: Story = {
  args: {
    choices: Array.from({ length: 30 }, (_, index) => ({
      id: `${index}`,
      label: `選択肢 ${index + 1}`,
      onSelect: noop,
    })),
  },
}

/** ボタンで選択肢の有無を切り替え、現れたら開き・無くなったら閉じることを確認する */
export const Interactive: Story = {
  render: () => {
    /** 選択肢を出しているか */
    const [shown, setShown] = useState(false)

    return (
      <div className="flex flex-col items-start gap-4">
        <button onClick={() => setShown((current) => !current)} type="button">
          選択肢: {shown ? 'あり' : 'なし'}
        </button>
        <StoryComponent
          choices={
            shown
              ? [
                  { id: 'execute', label: '実行', onSelect: noop },
                  { id: 'cancel', label: 'キャンセル', onSelect: noop },
                ]
              : []
          }
        />
      </div>
    )
  },
}
