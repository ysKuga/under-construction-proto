'use client'

import { createPortal } from 'react-dom'

import {
  EXECUTE_BUBBLE_OFFSET,
  ExecuteBubble,
} from '../../_components/execute-bubble'
import {
  WAYPOINT_BUBBLE_OFFSET,
  WaypointBubble,
} from '../../_components/waypoint-bubble'

import { useBotBubbles } from './index.hooks'

/**
 * bot 頭上の吹き出し（中継点・実行、issue #137/#226）
 *
 * - 経路が求まると表示する（中継点フローが `idle` 以外、選択モード中も継続）
 * - `WaypointBubble`（思考吹き出し）クリックで中継点選択モードを切り替える
 * - bot を挟んで反対側の `ExecuteBubble`（「実行」吹き出し）で経路に沿って自動移動する
 * - 吹き出しは自身では座標計算を持たないため、player bot 用のオーバーレイコンテナ
 *   （floor の 3D 空間外、bot の画面上の位置へ追従）へ `createPortal` で注入する。
 *   3D 空間外のため `GeoLayer` セルと重なってもクリックを奪われない
 */
export const BotBubbles = () => {
  const {
    executeBubbleRef,
    handleExecuteClick,
    handleWaypointBubbleClick,
    playerOverlayContainer,
    visible,
    waypointBubbleRef,
  } = useBotBubbles()

  if (!playerOverlayContainer) return null

  return createPortal(
    <>
      <WaypointBubble
        offset={WAYPOINT_BUBBLE_OFFSET}
        onClick={handleWaypointBubbleClick}
        ref={waypointBubbleRef}
        visible={visible}
      />
      <ExecuteBubble
        offset={EXECUTE_BUBBLE_OFFSET}
        onClick={handleExecuteClick}
        ref={executeBubbleRef}
        visible={visible}
      />
    </>,
    playerOverlayContainer,
  )
}
