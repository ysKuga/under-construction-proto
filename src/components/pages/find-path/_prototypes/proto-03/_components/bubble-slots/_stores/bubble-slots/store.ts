import { createStore } from 'zustand/vanilla'

import { ExecuteBubble } from '../../../execute-bubble'
import { WaypointBubble } from '../../../waypoint-bubble'

import {
  BubbleSlotEntry,
  BubbleSlotsStore,
  BubbleSlotsStoreState,
} from './types'

/** 格納する吹き出しの初期値 */
const INITIAL_BUBBLES: BubbleSlotEntry[] = [
  { Bubble: WaypointBubble, id: 'waypoint', visible: true },
  { Bubble: ExecuteBubble, id: 'execute', visible: true },
]

/** スロットへ格納する吹き出しと表示制御状態の store を生成する */
export const createBubbleSlotsStore = (): BubbleSlotsStore =>
  createStore<BubbleSlotsStoreState>((set) => ({
    bubbles: INITIAL_BUBBLES,
    setVisible: (id, visible) => {
      set((state) => ({
        bubbles: state.bubbles.map((bubble) =>
          bubble.id === id ? { ...bubble, visible } : bubble,
        ),
      }))
    },
  }))
