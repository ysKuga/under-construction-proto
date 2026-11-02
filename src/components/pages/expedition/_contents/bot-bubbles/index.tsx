'use client'

import { PLAYER_ACTOR_ID } from '@/components/pages/expedition/_stage-components/hex-stage/constants'

import { OverlayBubbleSlots } from './_components/overlay-bubble-slots'
import { useBotBubbles } from './index.hooks'

/**
 * bot 頭上の吹き出しをまとめて表示する
 *
 * - EN 切れ中は bot 頭上へ EN 切れの吹き出しを表示する（issue #137/#297）
 * - 経路提示中の選択肢（実行・中継点・キャンセル）は選択肢パネルへ移した（issue #393）
 * - 吹き出しの表示を許可しないフェーズ（ゴール後の終了状態）では全ての吹き出しを隠す（issue #137）
 * - 表示の出し分け・位置は `BubbleSlots` が担う（issue #297）
 */
export const BotBubbles = () => {
  const { playerBubbles } = useBotBubbles()

  return (
    <OverlayBubbleSlots
      initialBubbles={playerBubbles}
      overlayId={PLAYER_ACTOR_ID}
    />
  )
}
