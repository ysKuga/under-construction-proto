import { CSSProperties } from 'react'

import { BoxBot } from '@/components/samples/figure/box-bot'

import {
  GridPosition,
  GridSize,
  useActorControl,
  useActorPosition,
} from '../../../stage-04/_contexts/actor-position-context'
import { useKeyboardMove } from '../../../stage-04/_hooks/use-keyboard-move'

type ActorsLayerProps = {
  /** セル一辺の px。box-bot の描画サイズと設置領域の基準 */
  cellSize: number
}

/**
 * 設置領域 (grid セルへの占有枠) を box-bot 描画サイズに対して縮める係数
 *
 * - box-bot の style.height はシルエット + 余白 + 影分を含み、見た目より一回り大きい
 * - 1 未満にして枠を bot 表示より少し小さく収める (bot はわずかに枠からはみ出す)
 */
const FOOTPRINT_RATIO = 0.7

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

/**
 * actor 表示
 *
 * - 設置領域の div を floor(grid) の子としてセル中央へ絶対配置し、その中央へ box-bot を置く
 *   (設置領域は bot 表示より一回り小さく、bot はわずかに枠からはみ出す)
 * - 設置領域に床の rotateX を打ち消す逆 rotateX を掛け、傾いた床の上で bot を直立させる
 *   (`--floor-tilt` は floor から CSS 変数継承で降ってくる。傾き変更は再レンダリング不要)
 * - 移動は stage-04 の企図配線を流用: actor クリックで順送り / キーボードで方向移動
 * - stage-04 と違い key での再マウントはしない。Canvas 再生成を避け、left/top の
 *   transition でセル間を滑らせる
 * - box-bot の Canvas は設置領域より大きく、透明部分もクリックを奪う (occlude 未対応)。
 *   複数 actor を並べる段階で要対処
 */
export const ActorsLayer = (props: ActorsLayerProps) => {
  const { cellSize } = props

  const { dispatchMoveIntent, gridSize } = useActorControl()
  const actorPosition = useActorPosition()

  useKeyboardMove()

  const handleClick = () => {
    dispatchMoveIntent({
      source: 'actor-click',
      target: getNextSequentialPosition(actorPosition, gridSize),
    })
  }

  /** 設置領域の一辺 px。bot 表示より少し小さくして枠の過大感を抑える */
  const footprintSize = cellSize * FOOTPRINT_RATIO

  /**
   * box-bot 描画 (Canvas) の中心を設置領域中心へ寄せる補正 (px、rotateX 前空間)
   *
   * - box-bot-3d の内部 Canvas は設置領域 (root) より大きく中心もずれる。
   *   さらに逆 rotateX + perspective 投影で見かけのずれが変わる
   * - 係数は tilt=55 (Primary story) での実測合わせ。厳密な解析式ではない
   */
  const canvasCenterOffsetX = cellSize * 0.4
  const canvasCenterOffsetY = cellSize * 0.236

  /** 設置領域: セル中央への絶対配置 + 床の rotateX を相殺する逆回転 */
  const footprintStyle: CSSProperties = {
    height: footprintSize,
    left: `${((actorPosition.col + 0.5) / gridSize.cols) * 100}%`,
    position: 'absolute',
    top: `${((actorPosition.row + 0.5) / gridSize.rows) * 100}%`,
    transform: 'translate(-50%, -50%) rotateX(calc(-1 * var(--floor-tilt)))',
    transformOrigin: 'center bottom',
    transition: 'left 150ms, top 150ms, transform 150ms',
    width: footprintSize,
  }

  return (
    <div style={footprintStyle}>
      <BoxBot
        autoRotate={false}
        mode="3d"
        onClick={handleClick}
        orbit={false}
        style={{
          height: cellSize,
          left: '50%',
          position: 'absolute',
          top: '50%',
          transform: `translate(calc(-50% + ${canvasCenterOffsetX}px), calc(-50% + ${canvasCenterOffsetY}px))`,
          width: cellSize,
        }}
      />
    </div>
  )
}
