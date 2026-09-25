import { createStore } from 'zustand/vanilla'

import { WaypointFlowStore, WaypointFlowStoreState } from './types'

/** 経路の提示（目標・中継点）と中継点フローの状態の store を生成する */
export const createWaypointFlowStore = (): WaypointFlowStore =>
  createStore<WaypointFlowStoreState>((set) => ({
    clear: () => {
      set({ flowState: 'idle', objectiveCell: undefined, waypoints: [] })
    },
    flowState: 'idle',
    objectiveCell: undefined,
    propose: (cell) => {
      set({ flowState: 'proposing', objectiveCell: cell })
    },
    setFlowState: (flowState) => {
      set({ flowState })
    },
    setWaypoints: (waypoints) => {
      set({ waypoints })
    },
    unpropose: () => {
      set({ flowState: 'idle', objectiveCell: undefined })
    },
    waypoints: [],
  }))
