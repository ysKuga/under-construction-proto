import { CSSProperties } from 'react'

import { useActorNodeRegistry } from '../../_contexts/actor-node-registry'
import { PLAYER_ACTOR_ID } from '../../constants'

type GeoLayerProps = {
  /**
   * セルクリックで actor を即移動させるか
   *
   * - `false` の場合はセルを非対話の `<div>` で描画する（find-path 試作のように\
   *   クリックを別レイヤーへ委ねたいとき）
   */
  interactive: boolean
}

/** セル1マスの共通スタイル */
const cellStyle: CSSProperties = {
  backgroundColor: '#f1f5f9',
  border: '1px solid #cbd5e1',
  padding: 0,
}

/**
 * 地形 layer
 *
 * - floor(grid) 直下に敷き、grid アイテムとして cols x rows 個並ぶ
 * - `interactive` 時は各セルをボタンにし、クリックでそのセルへ actor を移動させる
 * - `moveActor` のみ参照し position は購読しない → actor 移動で再レンダリングしない
 */
export const GeoLayer = (props: GeoLayerProps) => {
  const { interactive } = props

  const { gridSize, moveActor } = useActorNodeRegistry()

  console.log('render: GeoLayer')

  return (
    <>
      {Array.from({ length: gridSize.rows }).map((_, row) =>
        Array.from({ length: gridSize.cols }).map((_, col) =>
          interactive ? (
            <button
              aria-label={`セル ${col}-${row}`}
              key={`${row}-${col}`}
              onClick={() => {
                moveActor(PLAYER_ACTOR_ID, { col, row })
              }}
              style={{ ...cellStyle, cursor: 'pointer' }}
              type="button"
            />
          ) : (
            <div key={`${row}-${col}`} style={cellStyle} />
          ),
        ),
      )}
    </>
  )
}
