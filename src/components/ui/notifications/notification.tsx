'use client'

import { CircleAlert, CircleCheck, CircleX, Info } from 'lucide-react'

const icons = {
  error: <CircleX aria-hidden="true" className="size-6 text-red-500" />,
  info: <Info aria-hidden="true" className="size-6 text-blue-500" />,
  success: <CircleCheck aria-hidden="true" className="size-6 text-green-500" />,
  warning: (
    <CircleAlert aria-hidden="true" className="size-6 text-yellow-500" />
  ),
}

export type NotificationProps = {
  notification: {
    id: string
    message?: string
    title: string
    type: keyof typeof icons
  }
  onDismiss: (id: string) => void
}

export const Notification = ({
  notification: { id, message, title, type },
  onDismiss,
}: NotificationProps) => {
  return (
    <div className="flex w-full flex-col items-center space-y-4 sm:items-end">
      <div className="pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black/5">
        <div aria-label={title} className="p-4" role="alert">
          <div className="flex items-start">
            <div className="shrink-0">{icons[type]}</div>
            <div className="ml-3 w-0 flex-1 pt-0.5">
              <p className="text-sm font-medium text-gray-900">{title}</p>
              <p className="mt-1 text-sm text-gray-500">{message}</p>
            </div>
            <div className="ml-4 flex shrink-0">
              <button
                className="inline-flex rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
                onClick={() => {
                  onDismiss(id)
                }}
              >
                <span className="sr-only">Close</span>
                <CircleX aria-hidden="true" className="size-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
