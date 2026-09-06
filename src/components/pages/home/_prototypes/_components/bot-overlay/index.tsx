import { PropsWithChildren, ReactNode } from 'react'

type BotOverlayProps = PropsWithChildren<{
  /** bot に重ねて表示する要素(action-anchor 等の操作ボタン群) */
  overlay: ReactNode
  /** bot 表示領域の一辺(px) */
  size: number
}>

/**
 * BotOverlay — bot 表示領域と同サイズのオーバーレイコンテナ
 *
 * - `children`(bot 本体)を中央配置し、`overlay` を同サイズで重ねる
 * - circle/square/anchor 等、画面座標ベースで bot を囲む配置パターン共通の土台
 */
export const BotOverlay = ({ children, overlay, size }: BotOverlayProps) => {
  return (
    <div className="relative" style={{ height: size, width: size }}>
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        {children}
      </div>
      {overlay}
    </div>
  )
}
