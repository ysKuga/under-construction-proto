'use client'

import {
  INITIAL_TILT_DEG,
  SLIDER_LABEL_STYLE,
} from '../../../../../../constants'

import { useStageSliders } from './index.hooks'

/**
 * ステージの調整スライダー（tilt・移動時間）
 *
 * - tilt は `Stage07Handle.setTilt` で床へ直接反映する（再レンダリングなし）
 * - 移動時間は `display-settings` store へ書き込み、stage content が購読して `Stage07` へ渡す
 */
export const StageSliders = () => {
  const { handleTiltChange, moveDurationMs, setMoveDurationMs } =
    useStageSliders()

  return (
    <div>
      <label style={SLIDER_LABEL_STYLE}>
        tilt{' '}
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
      </label>
      <label style={SLIDER_LABEL_STYLE}>
        移動時間(ms){' '}
        <input
          max={3000}
          min={50}
          onChange={(event) => setMoveDurationMs(Number(event.target.value))}
          step={10}
          type="range"
          value={moveDurationMs}
        />{' '}
        {moveDurationMs}ms
      </label>
    </div>
  )
}
