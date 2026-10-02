import { createStore } from 'zustand/vanilla'

import {
  BubbleSlotEntry,
  BubbleSlotsStore,
  BubbleSlotsStoreState,
} from './types'

/**
 * スロットへ格納する吹き出しと表示制御状態の store を生成する
 *
 * @param initialBubbles 格納する吹き出しの初期値
 */
export const createBubbleSlotsStore = (
  initialBubbles: BubbleSlotEntry[],
): BubbleSlotsStore =>
  createStore<BubbleSlotsStoreState>((set) => ({
    bubbles: initialBubbles,
    setVisible: (id, visible) => {
      set((state) =>
        state.visibility[id] === visible
          ? state
          : { visibility: { ...state.visibility, [id]: visible } },
      )
    },
    visibility: {},
  }))
