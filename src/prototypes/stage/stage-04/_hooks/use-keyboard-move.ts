import { useEffect } from 'react'

import {
  GridPosition,
  useActorControl,
  useActorPosition,
} from '../_contexts/actor-position-context'

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
 * 矢印キー / WASD による方向移動の企図イベントを発生させる
 * - target は現在位置からの絶対座標のみを渡し、境界処理は resolver のクランプに委ねる
 */
export const useKeyboardMove = (): void => {
  const { dispatchMoveIntent } = useActorControl()
  const actorPosition = useActorPosition()

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const direction = KEY_CODE_DIRECTION_MAP[event.code]

      if (!direction) {
        return
      }

      event.preventDefault()

      const delta = DIRECTION_DELTA[direction]

      dispatchMoveIntent({
        source: 'keyboard',
        target: {
          col: actorPosition.col + delta.col,
          row: actorPosition.row + delta.row,
        },
      })
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [dispatchMoveIntent, actorPosition])
}
