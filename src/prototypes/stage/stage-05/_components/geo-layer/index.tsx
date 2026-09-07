import { useActorControl } from '../../../stage-04/_contexts/actor-position-context'

/**
 * 地形 layer
 *
 * - 各セルをボタンにし、クリックでそのセルへの移動企図 (cell-click) を発生させる
 * - floor(grid) の直下に敷き、grid アイテムとして cols x rows 個並ぶ
 * - grid の row-major 順に出力する (外ループ row / 内ループ col)
 */
export const GeoLayer = () => {
  const { dispatchMoveIntent, gridSize } = useActorControl()

  return (
    <>
      {Array.from({ length: gridSize.rows }).map((_, row) =>
        Array.from({ length: gridSize.cols }).map((_, col) => (
          <button
            aria-label={`セル ${col}-${row}`}
            key={`${row}-${col}`}
            onClick={() => {
              dispatchMoveIntent({ source: 'cell-click', target: { col, row } })
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
