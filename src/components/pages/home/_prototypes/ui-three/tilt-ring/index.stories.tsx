import { Meta, StoryObj } from '@storybook/nextjs-vite'

import { withBotChildren } from '../../_story-decorators'

import { TiltRing } from '.'

const meta: Meta<typeof TiltRing> = {
  argTypes: {
    tiltDeg: { control: { max: 90, min: 0, step: 1, type: 'range' } },
    yawDeg: { control: { max: 360, min: 0, step: 1, type: 'range' } },
  },
  component: TiltRing,
  decorators: [withBotChildren],
}

export default meta
type Story = StoryObj<typeof TiltRing>

export const Default: Story = {
  args: {
    tiltDeg: 20,
    yawDeg: 0,
  },
}
