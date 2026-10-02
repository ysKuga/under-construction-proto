'use client'

import { PLAYER_ACTOR_ID } from '@/prototypes/stage/stage-06/constants'

import { OBJECTIVE_OVERLAY_ID } from '../../constants'

import { OverlayBubbleSlots } from './_contents/overlay-bubble-slots'
import { useBotBubbles } from './index.hooks'

/**
 * bot 頭上・目標セル上の吹き出しをまとめて表示する
 *
 * - 経路提示中の吹き出し（中継点・実行）を bot 頭上・目標セル上の両方へ表示する
 *   - 目標が遠いと、bot 頭上の吹き出しを操作するためにカーソルを bot まで戻す必要が
 *     あるため、目標セル上にも同じ組を表示する（issue #137）
 *   - 両者は同じ waypoint-flow store を参照し、表示・選択モードの切替が同期する
 * - EN 切れ中は bot 頭上へ EN 切れの吹き出しを表示し、中継点・実行を隠す（issue #137/#297）
 * - 表示の出し分け・位置は `BubbleSlots` が担う（issue #297）
 */
export const BotBubbles = () => {
  const { objectiveBubbles, playerBubbles } = useBotBubbles()

  return (
    <>
      <OverlayBubbleSlots
        initialBubbles={playerBubbles}
        overlayId={PLAYER_ACTOR_ID}
      />
      <OverlayBubbleSlots
        initialBubbles={objectiveBubbles}
        overlayId={OBJECTIVE_OVERLAY_ID}
      />
    </>
  )
}
