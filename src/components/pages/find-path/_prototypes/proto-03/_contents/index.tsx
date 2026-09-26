'use client'

import { EnergyDebugPanel } from '../../_components/energy-debug-panel'

import { BotBubbles } from './bot-bubbles'
import { ControlPanel } from './control-panel'
import { StageArea } from './stage-area'
import { Title } from './title'

/**
 * proto-03 のページ内容。各 content を並べるのみ
 *
 * - `_contents/` の各要素はここの直下で使う実装。props・定数・状態は各要素側に持つ
 * - Provider 群（`FindPathProto03Providers`）の内側で使う
 */
export const FindPathProto03Contents = () => (
  <div className="flex h-screen flex-col items-center justify-center gap-8 bg-white">
    <Title />
    <StageArea />
    <BotBubbles />
    <ControlPanel />
    <EnergyDebugPanel />
  </div>
)
