import { Meta, StoryObj } from '@storybook/react'

import { Button } from '@/components/ui/button'

import { ConfirmationDialog } from './confirmation-dialog'

const meta: Meta<typeof ConfirmationDialog> = {
  component: ConfirmationDialog,
}

export default meta

type Story = StoryObj<typeof ConfirmationDialog>

export const Danger: Story = {
  args: {
    body: 'Hello World',
    confirmButton: <Button className="bg-red-500">Confirm</Button>,
    icon: 'danger',
    title: 'Confirmation',
    triggerButton: <Button>Open</Button>,
  },
}

export const Info: Story = {
  args: {
    body: 'Hello World',
    confirmButton: <Button>Confirm</Button>,
    icon: 'info',
    title: 'Confirmation',
    triggerButton: <Button>Open</Button>,
  },
}
