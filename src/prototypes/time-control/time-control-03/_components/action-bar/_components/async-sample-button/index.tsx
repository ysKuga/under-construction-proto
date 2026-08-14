import { Button } from '@/components/ui/button'

import { useAsyncSampleButton } from './index.hooks'

/**
 * async listener 実演用サンプルイベントを発行するボタン
 *
 * - pending 状態をここに閉じ込め、`ActionBar` 本体・他ボタンの再レンダリングを避ける
 */
export const AsyncSampleButton = () => {
  const { dispatchAsyncSample, isDispatching } = useAsyncSampleButton()

  return (
    <Button
      isLoading={isDispatching}
      onClick={dispatchAsyncSample}
      type="button"
      variant="outline"
    >
      async sample
    </Button>
  )
}
