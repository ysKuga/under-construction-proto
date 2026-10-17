import { createStore } from 'zustand/vanilla'

import { FollowPathState, FollowPathStore } from './types'

/** 経路に沿った自動移動の進行状況の store を生成する */
export const createFollowPathStore = (): FollowPathStore =>
  createStore<FollowPathState>((set, get) => ({
    advance: () => {
      if (!get().isFollowing()) return

      set((state) => ({ followedCount: state.followedCount + 1 }))
    },
    end: () => {
      set({ followedCount: 0, followingPath: [] })
    },
    followedCount: 0,
    followingPath: [],
    isFollowing: () => get().followingPath.length > 0,
    start: (path) => {
      set({ followedCount: 0, followingPath: path })
    },
  }))
