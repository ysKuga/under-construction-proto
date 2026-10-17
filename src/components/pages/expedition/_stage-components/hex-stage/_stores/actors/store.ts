import { createStore } from 'zustand/vanilla'

import { Actor } from '@/types/theater/actor'

import { HexCell } from '../../_lib/hex'

import { ActorsState, ActorsStore } from './types'

/** actorId → DOM の map へ el を登録する(`el=null` なら登録解除) */
const registerElement = (
  elements: Partial<Record<Actor['id'], HTMLDivElement>>,
  actorId: Actor['id'],
  el: HTMLDivElement | null,
): Partial<Record<Actor['id'], HTMLDivElement>> => {
  if (el !== null) return { ...elements, [actorId]: el }

  return Object.fromEntries(
    Object.entries(elements).filter(([id]) => id !== actorId),
  )
}

/**
 * actor 位置 store を生成する
 *
 * @param initialActors 初期配置する actor 一覧(actorId → セル)
 */
export const createActorsStore = (
  initialActors: Record<Actor['id'], HexCell>,
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
    moveActor: (actorId, target, options) => {
      set((state) => ({
        actors: { ...state.actors, [actorId]: target },
        moveKinds: { ...state.moveKinds, [actorId]: options?.kind ?? 'move' },
      }))
    },
    moveKinds: {},
    overlayAnchors: {},
    overlayContainers: {},
    registerOverlayAnchor: (actorId, el) => {
      set((state) => ({
        overlayAnchors: registerElement(state.overlayAnchors, actorId, el),
      }))
    },
    registerOverlayContainer: (actorId, el) => {
      set((state) => ({
        overlayContainers: registerElement(
          state.overlayContainers,
          actorId,
          el,
        ),
      }))
    },
    spawnActor: (actorId, cell) => {
      set((state) => ({
        actors: { ...state.actors, [actorId]: cell },
      }))
    },
  }))
