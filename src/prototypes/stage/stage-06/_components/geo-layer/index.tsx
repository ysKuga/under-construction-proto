import { useActorNodeRegistry } from '../../_contexts/actor-node-registry'
import { PLAYER_ACTOR_ID } from '../../constants'

/**
 * 地形 layer
 *
 * - 各セルをボタンにし、クリックでそのセルへ actor を移動させる
 * - floor(grid) 直下に敷き、grid アイテムとして cols x rows 個並ぶ
 * - `moveActor` のみ参照し position は購読しない → actor 移動で再レンダリングしない
 */
export const GeoLayer = () => {
  const { gridSize, moveActor } = useActorNodeRegistry()

  console.log('render: GeoLayer')

  return (
    <>
      {Array.from({ length: gridSize.rows }).map((_, row) =>
        Array.from({ length: gridSize.cols }).map((_, col) => (
          <button
            aria-label={`セル ${col}-${row}`}
            key={`${row}-${col}`}
            onClick={() => {
              moveActor(PLAYER_ACTOR_ID, { col, row })
            }}
            style={{
              backgroundColor: '#f1f5f9',
              border: '1px solid #cbd5e1',
              cursor: 'pointer',
              padding: 0,
            }}
            type="button"
          />
        )),
      )}
    </>
  )
}
