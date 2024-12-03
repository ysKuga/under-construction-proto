import { Meta, StoryObj } from '@storybook/react'
import * as React from 'react'

import { Button } from '@/components/ui/button'
import { useDisclosure } from '@/hooks/use-disclosure'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './dialog'

const DemoDialog = () => {
  const { close, isOpen, open } = useDisclosure()
  const cancelButtonRef = React.useRef(null)

  return (
    <Dialog
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          close()
        } else {
          open()
        }
      }}
      open={isOpen}
    >
      <DialogTrigger asChild>
        <Button variant="outline">Open Dialog</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>Lorem ipsum</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">Lorem ipsum</div>

        <DialogFooter>
          <Button type="submit">Save changes</Button>
          <Button onClick={close} ref={cancelButtonRef} variant="outline">
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

const meta: Meta = {
  component: Dialog,
}

export default meta

type Story = StoryObj<typeof Dialog>

export const Demo: Story = {
  render: () => <DemoDialog />,
}
