'use client'

import * as React from 'react'

import { useDisclosure } from '@/hooks/use-disclosure'

import { Button } from '../button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '../drawer'

type FormDrawerProps = {
  children: React.ReactNode
  isDone: boolean
  submitButton: React.ReactElement
  title: string
  triggerButton: React.ReactElement
}

export const FormDrawer = ({
  children,
  isDone,
  submitButton,
  title,
  triggerButton,
}: FormDrawerProps) => {
  const { close, isOpen, open } = useDisclosure()

  React.useEffect(() => {
    if (isDone) {
      close()
    }
  }, [isDone, close])

  return (
    <Drawer
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          close()
        } else {
          open()
        }
      }}
      open={isOpen}
    >
      <DrawerTrigger asChild>{triggerButton}</DrawerTrigger>
      <DrawerContent className="flex max-w-[800px] flex-col justify-between sm:max-w-[540px]">
        <div className="flex flex-col">
          <DrawerHeader>
            <DrawerTitle>{title}</DrawerTitle>
          </DrawerHeader>
          <div>{children}</div>
        </div>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button type="submit" variant="outline">
              Close
            </Button>
          </DrawerClose>
          {submitButton}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
