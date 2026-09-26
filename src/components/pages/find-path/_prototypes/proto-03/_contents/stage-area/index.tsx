'use client'

import { FacingIndicator } from './_contents/facing-indicator'
import { Stage } from './_contents/stage'
import { StandaloneBot } from './_contents/standalone-bot'

/**
 * ステージと bot の状態表示を横に並べる
 *
 * - bot の状態表示は、独立 bot を上・向きインジケータを下に縦に並べる
 */
export const StageArea = () => (
  <div className="flex items-center gap-8">
    <Stage />
    <div className="flex flex-col items-center gap-2">
      <StandaloneBot />
      <FacingIndicator />
    </div>
  </div>
)
