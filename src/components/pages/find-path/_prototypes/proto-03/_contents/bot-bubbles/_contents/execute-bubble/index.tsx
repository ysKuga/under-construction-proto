'use client'

import { ExecuteBubble } from '../../../../_components/execute-bubble'

import { useExecuteBubbleContent } from './index.hooks'

/**
 * 「実行」吹き出し（issue #137/#226）
 *
 * - クリックで表示中の経路に沿って自動移動を開始する
 * - 右上の close ボタン(×)で目標設定をキャンセルする
 * - 中継点選択中は背後の経路を隠さないよう半透明にする
 * - 位置・表示状態は `BubbleSlots` から `BotBubble.Provider` 経由で受け取る
 */
export const ExecuteBubbleContent = () => {
  const { executeBubbleRef, handleClick, handleClose } =
    useExecuteBubbleContent()

  return (
    <ExecuteBubble
      onClick={handleClick}
      onClose={handleClose}
      ref={executeBubbleRef}
    />
  )
}
