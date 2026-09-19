'use client'

import { createContext, PropsWithChildren, useContext } from 'react'

import { HexCell } from '../../_lib/hex'

/**
 * セルの hover 説明文を取得する
 *
 * - stage-07 自体は find-path 固有の概念（障害物・アイテム等）を持たない。型だけ
 *   ここで定義し、実体（`getCellTitle` の中身）は呼び出し元（`CellTitleProvider`）
 *   が注入する（issue #137、PR #196 レビュー対応）
 */
type CellTitleContextValue = {
  /** cell の hover 説明文（省略時は付与しない） */
  getCellTitle: (cell: HexCell) => string | undefined
}

const CellTitleContext = createContext<CellTitleContextValue | undefined>(
  undefined,
)

/**
 * `getCellTitle` を Context 経由で配布する
 *
 * - 省略可能な機能のため Provider なしでも動作する（`useCellTitle` が
 *   `undefined` を返す）
 */
export const CellTitleProvider = (
  props: PropsWithChildren<CellTitleContextValue>,
) => {
  const { children, getCellTitle } = props

  return (
    <CellTitleContext.Provider value={{ getCellTitle }}>
      {children}
    </CellTitleContext.Provider>
  )
}

/**
 * `getCellTitle` を返す（`CellTitleProvider` なしなら常に `undefined` を返す関数）
 *
 * - hook 自体は cell を受け取らない。呼び出し側（`GeoLayer`）はセルのループ内で
 *   hook を呼べないため、ループの外で1度だけ呼び出し、戻り値の関数をループ内で使う
 */
export const useCellTitle = (): ((cell: HexCell) => string | undefined) =>
  useContext(CellTitleContext)?.getCellTitle ?? (() => undefined)
