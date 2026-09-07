import { CSSProperties } from 'react'

import { BoxBot01 } from '@/components/theater/figure/box-bot'

import {
  GridPosition,
  GridSize,
  useActorControl,
  useActorPosition,
} from '../../../stage-04/_contexts/actor-position-context'
import { useKeyboardMove } from '../../../stage-04/_hooks/use-keyboard-move'

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
 * 「クリックで次セルへ順送り」方式の次ターゲット座標を算出する
 *
 * - 右へ1マス、右端なら次行の左端へ折り返す
 * - 右下端であれば (0, 0) へ戻る
 * - stage-04 の同名 helper と同一ロジック (stage-04 側は非 export のため複製)
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

/** セル中央への絶対配置 + 床の rotateX を相殺する逆回転 */
const cellStyle = (
  col: number,
  row: number,
  gridSize: GridSize,
  size: number,
): CSSProperties => ({
  height: size,
  left: `${((col + 0.5) / gridSize.cols) * 100}%`,
  position: 'absolute',
  top: `${((row + 0.5) / gridSize.rows) * 100}%`,
  transform: 'translate(-50%, -53%) rotateX(calc(-1 * var(--floor-tilt)))',
  transformOrigin: 'center bottom',
  transition: 'left 150ms, top 150ms, transform 150ms',
  width: size,
})

/**
 * actor 表示
 *
 * - theater の box-bot-01 を floor(grid) の子としてセル中央へ絶対配置する
 * - box-bot-01 は表示領域 = 設置領域 (#108) のため Canvas は botSize と一致（マスとは独立）。
 *   傾いた床の上でも Canvas が設置領域と一致する (box-bot-01 の `resize={{ offsetSize: true }}`)
 * - 床の rotateX を打ち消す逆 rotateX を掛け、傾いた床の上で bot を直立させる
 *   (`--floor-tilt` は floor から CSS 変数継承。傾き変更は再レンダリング不要)
 * - 移動は stage-04 の企図配線を流用: actor クリックで順送り / キーボードで方向移動
 * - `actions={[]}` で jump / spin を無効化し、クリックは順送りのみに使う
 * - stage-04 と違い key での再マウントはしない。left/top の transition でセル間を滑らせる
 */
export const ActorsLayer = (props: ActorsLayerProps) => {
  const { botSize } = props

  const { dispatchMoveIntent, gridSize } = useActorControl()
  const actorPosition = useActorPosition()

  useKeyboardMove()

  const handleClick = () => {
    dispatchMoveIntent({
      source: 'actor-click',
      target: getNextSequentialPosition(actorPosition, gridSize),
    })
  }

  return (
    <BoxBot01
      actions={[]}
      onClick={handleClick}
      orbit={false}
      style={cellStyle(actorPosition.col, actorPosition.row, gridSize, botSize)}
    />
  )
}
