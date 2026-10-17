'use client'

import { INITIAL_TILT_DEG } from '../../../../../../../../constants'

import { useStageSliders } from './index.hooks'

/**
 * ステージの調整スライダー（tilt・移動時間）
 *
 * - 見出しの下へ字下げしてスライダーを置き、ポップオーバーの幅を抑える
 * - tilt は `Stage07Handle.setTilt` で床へ直接反映する（再レンダリングなし）
 * - 移動時間は `display-settings` store へ書き込み、stage content が購読して `Stage07` へ渡す
 */
export const StageSliders = () => {
  const { handleTiltChange, moveDurationMs, setMoveDurationMs } =
    useStageSliders()

  return (
    <div className="flex flex-col gap-2">
      <label className="flex flex-col gap-1">
        tilt
        <span className="flex items-center gap-2 pl-3">
          <input
            defaultValue={INITIAL_TILT_DEG}
            max={85}
            min={0}
            onChange={(event) => {
              handleTiltChange(Number(event.target.value))
            }}
            step={1}
            type="range"
          />
        </span>
      </label>
      <label className="flex flex-col gap-1">
        移動時間(ms)
        <span className="flex items-center gap-2 pl-3">
          <input
            max={3000}
            min={50}
            onChange={(event) => setMoveDurationMs(Number(event.target.value))}
            step={10}
            type="range"
            value={moveDurationMs}
          />
          {moveDurationMs}ms
        </span>
      </label>
    </div>
  )
}
