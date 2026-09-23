import { nanoid } from 'nanoid'
import { create } from 'zustand'

import { UseNotificationOptions } from './notification.hooks'

export type Notification = {
  id: string
  message?: string
  /** 自動フェードアウト・transition 時間の指定(省略可、`useNotification` へそのまま渡す) */
  options?: UseNotificationOptions
  title: string
  type: 'error' | 'info' | 'success' | 'warning'
}

type NotificationsStore = {
  addNotification: (notification: Omit<Notification, 'id'>) => void
  dismissNotification: (id: string) => void
  notifications: Notification[]
}

export const useNotifications = create<NotificationsStore>((set) => ({
  addNotification: (notification) =>
    set((state) => ({
      notifications: [
        ...state.notifications,
        { id: nanoid(), ...notification },
      ],
    })),
  dismissNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter(
        (notification) => notification.id !== id,
      ),
    })),
  notifications: [],
}))
