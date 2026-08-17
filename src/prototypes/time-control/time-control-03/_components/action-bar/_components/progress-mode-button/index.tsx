import { Button } from '@/components/ui/button'

import { useProgressModeButton } from './index.hooks'

/**
 * 進行モード (auto/manual) 全 actor 一括切替ボタン
 *
 * - progressMode 購読をここに閉じ込め、`ActionBar` 本体・他ボタンの再レンダリングを避ける
 */
export const ProgressModeButton = () => {
  const { progressMode, toggleProgressMode } = useProgressModeButton()

  return (
    <Button onClick={toggleProgressMode} type="button" variant="outline">
      mode: {progressMode}
    </Button>
  )
}
