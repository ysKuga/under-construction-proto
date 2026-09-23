import { createStore } from 'zustand/vanilla'

import { ActorId } from '@/prototypes/time-control/time-control-03/types'

import { HexCell } from '../../_lib/hex'

import { ActorsState, ActorsStore } from './types'

/**
 * actor 位置 store を生成する
 *
 * @param initialActors 初期配置する actor 一覧(actorId → セル)
 */
export const createActorsStore = (
  initialActors: Record<ActorId, HexCell>,
): ActorsStore =>
  createStore<ActorsState>((set) => ({
    actors: initialActors,
    despawnActor: (actorId) => {
      set((state) => ({
        actors: Object.fromEntries(
          Object.entries(state.actors).filter(([id]) => id !== actorId),
        ),
      }))
    },
    moveActor: (actorId, target) => {
      set((state) => ({
        actors: { ...state.actors, [actorId]: target },
      }))
    },
    overlayContainers: {},
    registerOverlayContainer: (actorId, el) => {
      set((state) => {
        if (el === null) {
          return {
            overlayContainers: Object.fromEntries(
              Object.entries(state.overlayContainers).filter(
                ([id]) => id !== actorId,
              ),
            ),
          }
        }

        return {
          overlayContainers: { ...state.overlayContainers, [actorId]: el },
        }
      })
    },
    spawnActor: (actorId, cell) => {
      set((state) => ({
        actors: { ...state.actors, [actorId]: cell },
      }))
    },
  }))
