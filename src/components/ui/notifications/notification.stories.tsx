import { Meta, StoryObj } from '@storybook/react'

import { Notification } from './notification'

const meta: Meta<typeof Notification> = {
  component: Notification,
  parameters: {
    controls: { expanded: true },
  },
  title: 'Components/Notifications',
}

export default meta

type Story = StoryObj<typeof Notification>

export const Info: Story = {
  args: {
    notification: {
      id: '1',
      message: 'This is info notification',
      title: 'Hello Info',
      type: 'info',
    },
    onDismiss: (id) => alert(`Dismissing Notification with id: ${id}`),
  },
}

export const Success: Story = {
  args: {
    notification: {
      id: '1',
      message: 'This is success notification',
      title: 'Hello Success',
      type: 'success',
    },
    onDismiss: (id) => alert(`Dismissing Notification with id: ${id}`),
  },
}

export const Warning: Story = {
  args: {
    notification: {
      id: '1',
      message: 'This is warning notification',
      title: 'Hello Warning',
      type: 'warning',
    },
    onDismiss: (id) => alert(`Dismissing Notification with id: ${id}`),
  },
}

export const Error: Story = {
  args: {
    notification: {
      id: '1',
      message: 'This is error notification',
      title: 'Hello Error',
      type: 'error',
    },
    onDismiss: (id) => alert(`Dismissing Notification with id: ${id}`),
  },
}
