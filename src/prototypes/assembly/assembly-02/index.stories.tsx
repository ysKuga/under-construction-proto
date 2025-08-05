import { Meta, StoryObj } from '@storybook/react'

import { cn } from '@/utils/cn'

import { Arm } from '../../../components/samples/_parts/arm'
import { Foot } from '../../../components/samples/_parts/foot'
import { Head } from '../../../components/samples/_parts/head'

import { Assembly02 as StoryComponent } from '.'

const meta: Meta<typeof StoryComponent> = {
  component: StoryComponent,
}

export default meta
type Story = StoryObj<typeof StoryComponent>

export const Primary: Story = {
  args: {
    children: (
      <>
        <Head className={cn('-top-12')} />
        <Arm className={cn('-left-6')} />
        <Arm className={cn('-right-6')} />
        <Foot className={cn('left-0 -bottom-14')} />
        <Foot className={cn('right-0 -bottom-14')} />
      </>
    ),
  },
}
