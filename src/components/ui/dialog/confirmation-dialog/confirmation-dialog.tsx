'use client'

import { CircleAlert, Info } from 'lucide-react'
import * as React from 'react'
import { useEffect } from 'react'

import { Button } from '@/components/ui/button'
import { useDisclosure } from '@/hooks/use-disclosure'

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../dialog'

export type ConfirmationDialogProps = {
  body?: string
  cancelButtonText?: string
  confirmButton: React.ReactElement
  icon?: 'danger' | 'info'
  isDone?: boolean
  title: string
  triggerButton: React.ReactElement
}

export const ConfirmationDialog = ({
  body = '',
  cancelButtonText = 'Cancel',
  confirmButton,
  icon = 'danger',
  isDone = false,
  title,
  triggerButton,
}: ConfirmationDialogProps) => {
  const { close, isOpen, open } = useDisclosure()
  const cancelButtonRef = React.useRef(null)

  useEffect(() => {
    if (isDone) {
      close()
    }
  }, [isDone, close])

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
      <DialogTrigger asChild>{triggerButton}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="flex">
          <DialogTitle className="flex items-center gap-2">
            {' '}
            {icon === 'danger' && (
              <CircleAlert aria-hidden="true" className="size-6 text-red-600" />
            )}
            {icon === 'info' && (
              <Info aria-hidden="true" className="size-6 text-blue-600" />
            )}
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
          {body && (
            <div className="mt-2">
              <p>{body}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          {confirmButton}
          <Button onClick={close} ref={cancelButtonRef} variant="outline">
            {cancelButtonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
