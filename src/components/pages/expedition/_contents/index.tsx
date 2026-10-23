'use client'

import { ClearedPhase } from '../_game-phases/cleared'

import { BotBubbles } from './bot-bubbles'
import { StageSection } from './stage-section'

/**
 * expedition のページ内容。各 content を並べるのみ
 *
 * - `_contents/` の各要素はここの直下で使う実装。props・定数・状態は各要素側に持つ
 * - Provider 群（`ExpeditionProviders`）の内側で使う
 * - デバッグ要素（`../_components/debug-panel`）は並べない。story で本要素の下へ並べる
 */
export const ExpeditionContents = () => (
  <div className="flex min-h-screen flex-col items-center gap-8 bg-white md:justify-center">
    <StageSection />
    <BotBubbles />
    <ClearedPhase />
  </div>
)
