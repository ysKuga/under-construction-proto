import { Button } from '@/components/ui/button'

import { useTimeScaleControl } from './index.hooks'

/** 選択可能な進行倍率。0 はポーズ相当 */
const TIME_SCALE_OPTIONS = [0, 0.5, 1, 2, 4]

/**
 * 進行倍率 (timeScale) 切替ボタン列
 *
 * - timeScale 購読をここに閉じ込め、`ActionBar` 本体・他ボタンの再レンダリングを避ける
 */
export const TimeScaleControl = () => {
  const { setTimeScale, timeScale } = useTimeScaleControl()

  return (
    <div className="flex gap-1">
      {TIME_SCALE_OPTIONS.map((option) => (
        <Button
          key={option}
          onClick={() => setTimeScale(option)}
          type="button"
          variant={option === timeScale ? 'default' : 'outline'}
        >
          {option === 0 ? 'pause' : `${option}x`}
        </Button>
      ))}
    </div>
  )
}
