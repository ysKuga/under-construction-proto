import { Meta, StoryObj } from '@storybook/react'
import { CSSProperties } from 'react'

import { Arm } from '@/prototypes/assembly/_parts/arm'
import { Body } from '@/prototypes/assembly/_parts/body'
import { Foot } from '@/prototypes/assembly/_parts/foot'
import { Head } from '@/prototypes/assembly/_parts/head'
import { cn } from '@/utils/cn'

import { Assembly as StoryComponent } from '.'

const meta: Meta<typeof StoryComponent> = {
  component: StoryComponent,
}

export default meta
type Story = StoryObj<typeof StoryComponent>

/** Arm 用共通 style */
const armStyle = {
  top: '34%',
  ...{
    height: '30%',
    width: '7%',
  },
} satisfies CSSProperties

/** Foot 用共通 style */
const footStyle = {
  bottom: '3%',
  ...{
    height: '20%',
    width: '8%',
  },
} satisfies CSSProperties

export const Primary: Story = {
  args: {
    children: (
      // 位置、大きさについてはすべてパーセンテージでの指定を行う
      <>
        <Head
          style={{
            top: '16%',
            ...{
              height: '15%',
              width: '25%',
            },
          }}
        />
        <Body
          style={{
            top: '34%',
            ...{
              height: '40%',
              width: '30%',
            },
          }}
        />
        <Arm
          style={{
            ...armStyle,
            left: '25%',
          }}
        />
        <Arm
          style={{
            ...armStyle,
            right: '25%',
          }}
        />
        <Foot
          style={{
            ...footStyle,
            left: '35%',
          }}
        />
        <Foot
          style={{
            ...footStyle,
            right: '35%',
          }}
        />
      </>
    ),
    className: cn(
      // 枠組みを表示させて内部要素の位置関係を明確にする。
      'border border-solid border-gray-300',
    ),
    style: {
      height: 200,
    },
  },
}
