'use client'

import { BoxBot01 } from '@/components/theater/figure/box-bot'

import { useStandaloneBotSize } from './_hooks/use-standalone-bot-size'
import {
  STANDALONE_BOT_ACTIONS,
  useStandaloneBotEventTarget,
} from './index.hooks'

/**
 * 表示領域(Canvas)の高さの、設置領域の一辺に対する倍率
 *
 * - EN 切れで拡大した接地影が下端で見切れないよう、設置領域より縦へ伸ばす
 * - `canvasHeight` は上下対称に伸びる(下だけ伸ばすには BoxBot01 のカメラ改修が要るため不採用)。\
 *   上側の伸長分は透明で見た目に影響しない
 * - 設置領域は変えないため周囲のレイアウトは不変。bot の見かけの大きさも不変(fov 補正)
 */
const STANDALONE_BOT_CANVAS_HEIGHT_RATIO = 1.5

/**
 * action 設定の上書き
 *
 * - EN 切れ時に接地影を 2 倍にする(状態表示のみ。ステージ上の bot は等倍のまま)
 */
const STANDALONE_BOT_ACTION_CONFIG = { energyOut: { shadowScale: 2.2 } }

/**
 * ステージ上の bot とは別に独立表示し、歩行・EN 切れを同期する bot（issue #248）
 *
 * - `interactive` は既定(true)のままにする。false だと walking・energyOut 等の action が
 *   dispatch を無視し、同期されない
 * - クリック(既定の `clickBindings` = jump/spin)は `actions` に含めないため反応しない
 *   （ステージ上の bot と同じ）
 * - 大きさは画面幅で切り替える（`useStandaloneBotSize`）
 */
export const StandaloneBot = () => {
  const standaloneBotEventTarget = useStandaloneBotEventTarget()
  /** 独立 bot の一辺 px（画面幅で切替） */
  const standaloneBotSize = useStandaloneBotSize()

  return (
    <BoxBot01
      actionConfig={STANDALONE_BOT_ACTION_CONFIG}
      actions={STANDALONE_BOT_ACTIONS}
      canvasHeight={standaloneBotSize * STANDALONE_BOT_CANVAS_HEIGHT_RATIO}
      eventTarget={standaloneBotEventTarget}
      orbit={false}
      style={{ height: standaloneBotSize, width: standaloneBotSize }}
    />
  )
}
