import { CSSProperties, useCallback } from 'react'

import { BoxBot01 } from '@/components/theater/figure/box-bot'

import {
  GridPosition,
  GridSize,
  useActorNodeRegistry,
} from '../../_contexts/actor-node-registry'
import { useKeyboardMove } from '../../_hooks/use-keyboard-move'
import { PLAYER_ACTOR_ID } from '../../constants'

type ActorsLayerProps = {
  /**
   * actor (box-bot-01) の一辺 px
   *
   * - box-bot-01 の設置領域 (= 表示領域 = Canvas) に渡す
   * - マスのサイズとは独立。グリッドが変わっても bot の見た目は据え置く
   */
  botSize: number
}

/**
 * 「クリックで次セルへ順送り」の次ターゲットを算出する
 *
 * - 右へ1マス、右端なら次行の左端へ折り返す。右下端なら (0, 0) へ戻る
 * - stage-04/05 の同名 helper と同一ロジック (非 export のため複製)
 */
const getNextSequentialPosition = (
  current: GridPosition,
  gridSize: GridSize,
): GridPosition => {
  const isLastCol = current.col >= gridSize.cols - 1

  return {
    col: isLastCol ? 0 : current.col + 1,
    row: isLastCol
      ? current.row >= gridSize.rows - 1
        ? 0
        : current.row + 1
      : current.row,
  }
}

/**
 * セル中央への絶対配置 + 床の rotateX を相殺する逆回転
 *
 * - left/top は移動後に registry が直書きする。ここで渡すのは初期描画時の値のみ
 */
const cellStyle = (
  position: GridPosition,
  gridSize: GridSize,
  size: number,
): CSSProperties => ({
  height: size,
  left: `${((position.col + 0.5) / gridSize.cols) * 100}%`,
  position: 'absolute',
  top: `${((position.row + 0.5) / gridSize.rows) * 100}%`,
  transform: 'translate(-50%, -53%) rotateX(calc(-1 * var(--floor-tilt)))',
  transformOrigin: 'center bottom',
  transition: 'left 150ms, top 150ms, transform 150ms',
  width: size,
})

/**
 * actor 表示
 *
 * - box-bot-01 を位置決め用 div でくるみ、floor(grid) の子としてセル中央へ絶対配置する
 * - 位置は `ActorNodeRegistryProvider` が div の `left/top` を直書きして反映する。
 *   position を state で持たないため、移動で再レンダリングしない
 * - 床の rotateX を打ち消す逆 rotateX で、傾いた床の上でも直立させる
 *   (`--floor-tilt` は floor から CSS 変数継承。傾き変更も再レンダリング不要)
 * - 操作 3 系統: セルクリック (geo-layer) / 矢印キー・WASD (useKeyboardMove) /
 *   bot クリックで順送り (onClick)
 * - `actions={[]}` で jump / spin を無効化。動作確認用の静的 bot を近/遠の隅へ 1 体ずつ
 */
export const ActorsLayer = (props: ActorsLayerProps) => {
  const { botSize } = props

  const {
    getActorPosition,
    gridSize,
    initialPosition,
    moveActor,
    registerActorNode,
  } = useActorNodeRegistry()

  useKeyboardMove(PLAYER_ACTOR_ID)

  console.log('render: ActorsLayer')

  const actorNodeRef = useCallback(
    (el: HTMLDivElement | null) => {
      registerActorNode(PLAYER_ACTOR_ID, el)
    },
    [registerActorNode],
  )

  const handleClick = () => {
    moveActor(
      PLAYER_ACTOR_ID,
      getNextSequentialPosition(getActorPosition(PLAYER_ACTOR_ID), gridSize),
    )
  }

  /** 動作確認用の静的 bot (遠/近の隅) */
  const staticCells: GridPosition[] = [
    { col: gridSize.cols - 1, row: gridSize.rows - 1 },
    { col: 0, row: 0 },
  ]

  return (
    <>
      <div
        ref={actorNodeRef}
        style={cellStyle(initialPosition, gridSize, botSize)}
      >
        <BoxBot01
          actions={[]}
          onClick={handleClick}
          orbit={false}
          style={{ height: botSize, width: botSize }}
        />
      </div>
      {staticCells.map((cell) => (
        <div
          key={`${cell.col}-${cell.row}`}
          style={cellStyle(cell, gridSize, botSize)}
        >
          <BoxBot01
            actions={[]}
            interactive={false}
            orbit={false}
            style={{ height: botSize, width: botSize }}
          />
        </div>
      ))}
    </>
  )
}
