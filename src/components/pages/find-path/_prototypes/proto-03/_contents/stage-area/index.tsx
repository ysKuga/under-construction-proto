'use client'

import { Stage } from './_contents/stage'
import { StandaloneBot } from './_contents/standalone-bot'

/** ステージと独立 bot を横に並べる */
export const StageArea = () => (
  <div className="flex items-center gap-8">
    <Stage />
    <StandaloneBot />
  </div>
)
