'use client'

import { createContext, PropsWithChildren, useContext, useMemo } from 'react'

import { HexCell } from '../../_lib/hex'

/**
 * セルの hover 通知
 *
 * - stage-07 自体は hover 時の表示（セル情報パネル等）を持たない。通知の口だけ
 *   ここで定義し、受け取った後の処理は呼び出し元（`CellHoverProvider`）が注入する
 *   （issue #137、PR #308）
 */
type CellHoverContextValue = {
  /** hover 中のセルが変わった時（`undefined` は hover 解除） */
  onCellHover: (cell: HexCell | undefined) => void
}

/** Provider なし時の通知先（毎レンダー新規参照にしないため module 定数） */
const noop = () => {}

const CellHoverContext = createContext<CellHoverContextValue | undefined>(
  undefined,
)

/**
 * `onCellHover` を Context 経由で配布する
 *
 * - 省略可能な機能のため Provider なしでも動作する（`useHandleCellHover` が
 *   何もしない関数を返す）
 * - value を memo 化し、`onCellHover` が固定参照なら `GeoLayer`（`React.memo`）を
 *   再レンダリングさせない
 */
export const CellHoverProvider = (
  props: PropsWithChildren<CellHoverContextValue>,
) => {
  const { children, onCellHover } = props
  /** Context value（`onCellHover` が変わった時のみ作り直す） */
  const value = useMemo(() => ({ onCellHover }), [onCellHover])

  return (
    <CellHoverContext.Provider value={value}>
      {children}
    </CellHoverContext.Provider>
  )
}

/** hover 通知関数を返す（`CellHoverProvider` なしなら何もしない関数） */
export const useHandleCellHover = (): CellHoverContextValue['onCellHover'] =>
  useContext(CellHoverContext)?.onCellHover ?? noop
