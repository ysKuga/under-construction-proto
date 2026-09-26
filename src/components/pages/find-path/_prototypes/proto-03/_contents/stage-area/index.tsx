'use client'

import { FacingIndicator } from './_contents/facing-indicator'
import { Stage } from './_contents/stage'
import { StandaloneBot } from './_contents/standalone-bot'

/** ステージ・独立 bot・向きインジケータを横に並べる */
export const StageArea = () => (
  <div className="flex items-center gap-8">
    <Stage />
    <StandaloneBot />
    <FacingIndicator />
  </div>
)
