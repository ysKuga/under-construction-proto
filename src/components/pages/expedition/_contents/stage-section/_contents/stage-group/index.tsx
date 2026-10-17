'use client'

import { BotStatusPanel } from './_contents/bot-status-panel'
import { Stage } from './_contents/stage'

/** ステージと bot の状態表示を横に並べる */
export const StageGroup = () => (
  <div className="flex items-center">
    <Stage />
    <BotStatusPanel />
  </div>
)
