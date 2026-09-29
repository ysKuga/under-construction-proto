'use client'

import { PLAYER_ACTOR_ID } from '@/prototypes/stage/stage-06/constants'

import { OBJECTIVE_OVERLAY_ID } from '../../constants'

import { BubblePair } from './_contents/bubble-pair'
import { PlayerEnergyDepletedBubble } from './_contents/player-energy-depleted-bubble'

/**
 * bot 頭上・目標セル上の吹き出しをまとめて表示する
 *
 * - 経路提示中の吹き出し（中継点・実行）を bot 頭上・目標セル上の両方へ表示する
 *   - 目標が遠いと、bot 頭上の吹き出しを操作するためにカーソルを bot まで戻す必要が
 *     あるため、目標セル上にも同じ組を表示する（issue #137）
 *   - 両者は同じ waypoint-flow store を参照し、表示・選択モードの切替が同期する
 * - EN 切れ中は bot 頭上へ EN 切れの吹き出しを表示する（issue #137）
 */
export const BotBubbles = () => (
  <>
    <BubblePair overlayId={PLAYER_ACTOR_ID} />
    <BubblePair overlayId={OBJECTIVE_OVERLAY_ID} />
    <PlayerEnergyDepletedBubble />
  </>
)
