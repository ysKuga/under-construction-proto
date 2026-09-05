'use client'

import { useState } from 'react'

import {
  BoxBot,
  useBoxBotActionDispatcher,
} from '@/components/samples/figure/box-bot'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/cn'

import { ActionCircle } from './ui/action-circle'
import { ActionRing } from './ui/action-ring'
import { ActionRow } from './ui/action-row'
import { ActionSingle } from './ui/action-single'
import { ActionSquare } from './ui/action-square'

/** 歩くボタンを解放するまでに必要なジャンプ回数 */
const JUMPS_TO_UNLOCK_WALK = 3

/** bot 表示領域の一辺(px)。circle/square オーバーレイの基準サイズも兼ねる */
const CANVAS_HEIGHT = 640

export type Proto02Props = {
  /** 操作要素の配置パターン(既定: `row`) */
  actionLayout?: 'circle' | 'ring' | 'row' | 'single' | 'square'
}

/**
 * Proto02 — トップページ試作(操作 UI 要素検討)
 *
 * - proto-01 の box-bot 操作を土台に、操作 UI 要素の配置バリエーション(`ui/action-*`)を検討する
 * - 追加した操作要素は挙動未接続の見た目のみ(`ui/CLAUDE.md` 参照)
 */
const Proto02 = ({ actionLayout = 'row' }: Proto02Props) => {
  /** box-bot と共有し、walking action を発火する EventTarget */
  const [eventTarget] = useState(() => new EventTarget())
  const { walkingToggle } = useBoxBotActionDispatcher(eventTarget)

  /** body/head クリックによるジャンプ回数 */
  const [jumpCount, setJumpCount] = useState(0)
  /** 歩行中か */
  const [walking, setWalking] = useState(false)

  /** ジャンプ回数がしきい値に達し、歩くボタンを出せるか */
  const walkUnlocked = jumpCount >= JUMPS_TO_UNLOCK_WALK
  /** bot を囲むオーバーレイ配置(circle/square)か。表示領域を circle/square と同サイズに揃える必要がある */
  const isOverlayLayout = actionLayout === 'circle' || actionLayout === 'square'

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-8 bg-white">
      <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
        Under Construction Proto
      </h1>
      {/* circle/square は bot 表示領域と同サイズの relative コンテナで囲み、絶対配置のボタンを重ねる */}
      <div
        className="relative"
        style={
          isOverlayLayout
            ? { height: CANVAS_HEIGHT, width: CANVAS_HEIGHT }
            : undefined
        }
      >
        <div
          className={
            isOverlayLayout
              ? 'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'
              : undefined
          }
        >
          {/* canvasHeight: 最大ズームイン時に頭が Canvas 上端で見切れないよう縦の可動域を足す。
              fov 側で補正するため bot の見かけの大きさは不変(#108) */}
          <BoxBot
            bodyBobbing
            canvasHeight={CANVAS_HEIGHT}
            eventTarget={eventTarget}
            mode="3d"
            onClick={() => setJumpCount((c) => c + 1)}
          >
            {actionLayout === 'ring' && <ActionRing />}
          </BoxBot>
        </div>
        {actionLayout === 'circle' && <ActionCircle />}
        {actionLayout === 'square' && <ActionSquare />}
      </div>
      {/* ボタン領域を常時確保する。条件マウントすると flex 再センタリングで
          BoxBot ラッパーが動き、内部の絶対配置 Canvas ごと bot が跳ねる(カクつき)。
          Canvas(設置領域より大きい)が被るため z-index を明示 */}
      <div className="relative z-10 flex h-9 items-center">
        <Button
          className={cn(
            'transition-all duration-300 ease-out',
            walkUnlocked
              ? 'translate-y-0 opacity-100'
              : 'pointer-events-none translate-y-3 opacity-0',
          )}
          onClick={() => {
            void walkingToggle()
            setWalking((v) => !v)
          }}
          type="button"
          variant="outline"
        >
          {walking ? '止まる' : '歩く'}
        </Button>
      </div>
      {actionLayout === 'row' && <ActionRow />}
      {actionLayout === 'single' && <ActionSingle />}
    </div>
  )
}

export default Proto02
