import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'

/** グリッド上の位置 (0-indexed) */
export type GridPosition = {
  col: number
  row: number
}

/** グリッドの形状 */
export type GridSize = {
  cols: number
  rows: number
}

/** 移動企図イベントの発生源 */
export type MoveIntentSource = 'actor-click' | 'cell-click' | 'keyboard'

/** 移動対象を指定する企図イベント (action-phase.md でいう Intent 相当) */
export type MoveIntentEvent = {
  source: MoveIntentSource
  target: GridPosition
}

type ActorPositionContextValue = {
  dispatchMoveIntent: (event: MoveIntentEvent) => void
  gridSize: GridSize
  position: GridPosition
}

const ActorPositionContext = createContext<ActorPositionContextValue | null>(
  null,
)

/**
 * target を安全な範囲にクランプして確定する
 * - 経路探索は行わず、企図イベントの発生源が計算した target をそのまま反映する
 * - 境界処理 (クランプ/ラップアラウンド/ワープ) の違いは発生源側の責務とし、
 *   ここでは範囲内へ収めるだけの単一の仕事に徹する
 */
const resolveMoveIntent = (
  target: GridPosition,
  gridSize: GridSize,
): GridPosition => {
  const clamp = (value: number, max: number) => {
    return Math.min(Math.max(value, 0), max)
  }

  return {
    col: clamp(target.col, gridSize.cols - 1),
    row: clamp(target.row, gridSize.rows - 1),
  }
}

type ActorPositionProviderProps = PropsWithChildren<{
  gridSize: GridSize
  initialPosition?: GridPosition
}>

export const ActorPositionProvider = (props: ActorPositionProviderProps) => {
  const { children, gridSize, initialPosition = { col: 0, row: 0 } } = props

  const [position, setPosition] = useState<GridPosition>(initialPosition)

  const dispatchMoveIntent = useCallback(
    (event: MoveIntentEvent) => {
      setPosition(resolveMoveIntent(event.target, gridSize))
    },
    [gridSize],
  )

  const value = useMemo(
    () => ({ dispatchMoveIntent, gridSize, position }),
    [dispatchMoveIntent, gridSize, position],
  )

  return (
    <ActorPositionContext.Provider value={value}>
      {children}
    </ActorPositionContext.Provider>
  )
}

export const useActorPosition = (): ActorPositionContextValue => {
  const context = useContext(ActorPositionContext)

  if (context === null) {
    throw new Error(
      'useActorPosition should be used within <ActorPositionProvider>',
    )
  }

  return context
}
