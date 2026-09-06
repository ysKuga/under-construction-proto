import { cn } from '@/utils/cn'

import { ActorPositionProvider } from '../stage-04/_contexts/actor-position-context'

import { ActorsLayer } from './_components/actors-layer'
import { GeoLayer } from './_components/geo-layer'
import { PerspectiveViewport } from './_lib/perspective'

type Stage05Props = {
  /** 列数 */
  cols: number
  /** 最奥行のセル倍率 (最前行を 1 とした相対値、0-1) */
  depthScale: number
  /** 描画領域の高さ (px) */
  height: number
  /** 行数 */
  rows: number
  /** 描画領域の幅 (px) */
  width: number
}

/**
 * 舞台 (stage) — CSS 2D scale 補間で遠近を付けた版
 *
 * - stage-04 の ActorPositionProvider / MoveIntent / キーボード移動をそのまま流用する
 * - 位置→画面座標の投影のみ `_lib/perspective` の projectCell へ差し替える
 * - 奥行きに伴う前後関係は「奥の行から描画」の DOM 順で解決し、z-index は使わない
 */
export const Stage05 = (props: Stage05Props) => {
  const { cols, depthScale, height, rows, width } = props

  /** 遠近投影のレイアウト指定 */
  const viewport: PerspectiveViewport = { depthScale, height, width }

  return (
    <ActorPositionProvider gridSize={{ cols, rows }}>
      <div
        className={cn('ui-container ui-stage', 'relative')}
        style={{ height, width }}
      >
        <GeoLayer viewport={viewport} />
        <ActorsLayer viewport={viewport} />
      </div>
    </ActorPositionProvider>
  )
}
