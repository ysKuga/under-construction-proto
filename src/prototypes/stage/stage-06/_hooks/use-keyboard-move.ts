import { useEffect } from 'react'

import {
  GridPosition,
  useActorNodeRegistry,
} from '../_contexts/actor-node-registry'

type Direction = 'down' | 'left' | 'right' | 'up'

const DIRECTION_DELTA: Record<Direction, GridPosition> = {
  down: { col: 0, row: 1 },
  left: { col: -1, row: 0 },
  right: { col: 1, row: 0 },
  up: { col: 0, row: -1 },
}

/** event.code ベースで判定する (キーボードレイアウト非依存) */
const KEY_CODE_DIRECTION_MAP: Record<string, Direction> = {
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  ArrowUp: 'up',
  KeyA: 'left',
  KeyD: 'right',
  KeyS: 'down',
  KeyW: 'up',
}

/**
 * 矢印キー / WASD で actor を方向移動させる
 *
 * - 現在セル (registry の ref read) + delta を `moveActor` へ渡す。境界は registry がクランプ
 * - stage-04 版と違い position を購読しないため、移動で再レンダリングしない
 *
 * @param actorId 対象 actor の id
 */
export const useKeyboardMove = (actorId: string): void => {
  const { getActorPosition, moveActor } = useActorNodeRegistry()

  useEffect(() => {
    // 矢印キー / WASD の keydown を移動企図へ変換する
    const handleKeyDown = (event: KeyboardEvent) => {
      const direction = KEY_CODE_DIRECTION_MAP[event.code]

      if (!direction) {
        return
      }

      event.preventDefault()

      const current = getActorPosition(actorId)
      const delta = DIRECTION_DELTA[direction]

      moveActor(actorId, {
        col: current.col + delta.col,
        row: current.row + delta.row,
      })
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [actorId, getActorPosition, moveActor])
}
