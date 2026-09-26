'use client'

import { createPortal } from 'react-dom'

import {
  EXECUTE_BUBBLE_OFFSET,
  ExecuteBubble,
} from '../../../../_components/execute-bubble'
import {
  WAYPOINT_BUBBLE_OFFSET,
  WaypointBubble,
} from '../../../../_components/waypoint-bubble'

import { useBubblePair } from './index.hooks'
import { BubblePairProps } from './index.types'

/**
 * 吹き出しの組（中継点・実行、issue #137/#226）
 *
 * - `overlayId` のオーバーレイコンテナ（bot 頭上・目標セル上）へ注入する
 * - 経路が求まると表示する（中継点フローが `idle` 以外、選択モード中も継続）
 * - `WaypointBubble`（思考吹き出し）クリックで中継点選択モードを切り替える
 * - bot を挟んで反対側の `ExecuteBubble`（「実行」吹き出し）で経路に沿って自動移動する
 * - 吹き出しは自身では座標計算を持たないため、オーバーレイコンテナ
 *   （floor の 3D 空間外、アンカーの画面上の位置へ追従）へ `createPortal` で注入する。
 *   3D 空間外のため `GeoLayer` セルと重なってもクリックを奪われない
 */
export const BubblePair = (props: BubblePairProps) => {
  const {
    executeBubbleRef,
    handleExecuteClick,
    handleWaypointBubbleClick,
    overlayContainer,
    visible,
    waypointBubbleRef,
  } = useBubblePair(props)

  if (!overlayContainer) return null

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
    overlayContainer,
  )
}
