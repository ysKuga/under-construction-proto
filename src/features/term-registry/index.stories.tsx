import { Meta, StoryObj } from '@storybook/nextjs-vite'

import {
  energyRecoveryItemTerm,
  energyRecoverySpotTerm,
  energyTerm,
  obstacleTerm,
} from '.'

const meta: Meta = {}

export default meta
type Story = StoryObj

/** 定義済みの用語 */
const terms = [
  energyTerm,
  energyRecoveryItemTerm,
  energyRecoverySpotTerm,
  obstacleTerm,
]

/** 用語の一覧（表示 component を hover すると説明を表示する） */
export const List: Story = {
  render: () => (
    <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
      {terms.map((term) => (
        <div className="contents" key={term.englishName}>
          <dt>
            <term.component />
          </dt>
          <dd>
            {term.name}（{term.englishName}）: {term.description}
          </dd>
        </div>
      ))}
    </dl>
  ),
}
