import { Meta, StoryObj } from '@storybook/nextjs-vite'

import { term } from '.'

const meta: Meta = {}

export default meta
type Story = StoryObj

/** 用語の一覧（表示 component を hover すると説明を表示する） */
export const List: Story = {
  render: () => (
    <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
      {Object.values(term).map((entry) => (
        <div className="contents" key={entry.englishName}>
          <dt>
            <entry.component />
          </dt>
          <dd>
            {entry.name}（{entry.englishName}）: {entry.description}
          </dd>
        </div>
      ))}
    </dl>
  ),
}
