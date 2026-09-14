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
  /**
   * セル(div/button)の DOM を visibility registry 等へ登録する
   *
   * - 省略時は登録しない（常時表示）。渡した場合、呼び出し元の可視判定に
   *   従って床タイル自体の表示/非表示が切り替わる（find-path proto-02 で使用）
   */
  registerVisibilityNode?: (
    cell: { col: number; row: number },
    el: HTMLElement | null,
  ) => void
}

/**
 * セル1マスの共通スタイル
 *
 * - `gridColumn`/`gridRow` を明示指定する。CSS Grid の auto-placement は
 *   `display: none` の item を配置計算から除外するため、visibility registry で
 *   一部セルを非表示にすると残った可視セルが詰めて再配置されてしまう
 */
const cellStyle = (col: number, row: number): CSSProperties => ({
  backgroundColor: '#f1f5f9',
  border: '1px solid #cbd5e1',
  gridColumn: col + 1,
  gridRow: row + 1,
  padding: 0,
})

/**
 * 地形 layer
 *
 * - floor(grid) 直下に敷き、grid アイテムとして cols x rows 個並ぶ
 * - `interactive` 時は各セルをボタンにし、クリックでそのセルへ actor を移動させる
 * - `moveActor` のみ参照し position は購読しない → actor 移動で再レンダリングしない
 */
export const GeoLayer = (props: GeoLayerProps) => {
  const { interactive, registerVisibilityNode } = props

  const { gridSize, moveActor } = useActorNodeRegistry()

  console.log('render: GeoLayer')

  return (
    <>
      {Array.from({ length: gridSize.rows }).map((_, row) =>
        Array.from({ length: gridSize.cols }).map((_, col) => {
          const cell = { col, row }

          return interactive ? (
            <button
              aria-label={`セル ${col}-${row}`}
              key={`${row}-${col}`}
              onClick={() => {
                moveActor(PLAYER_ACTOR_ID, cell)
              }}
              ref={(el) => registerVisibilityNode?.(cell, el)}
              style={{ ...cellStyle(col, row), cursor: 'pointer' }}
              type="button"
            />
          ) : (
            <div
              key={`${row}-${col}`}
              ref={(el) => registerVisibilityNode?.(cell, el)}
              style={cellStyle(col, row)}
            />
          )
        }),
      )}
    </>
  )
}
