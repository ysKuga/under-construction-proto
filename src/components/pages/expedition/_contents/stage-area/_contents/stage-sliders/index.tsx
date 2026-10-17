'use client'

import { INITIAL_TILT_DEG, SLIDER_LABEL_STYLE } from '../../../../constants'

import { useStageSliders } from './index.hooks'

/**
 * ステージの調整スライダー（tilt・移動時間・歩行周期上限・脚振り角・体の上下量）
 *
 * - tilt は `Stage07Handle.setTilt` で床へ直接反映する（再レンダリングなし）
 * - tilt 以外は `display-settings` store へ書き込み、stage content が購読して `Stage07` へ渡す
 */
export const StageSliders = () => {
  const {
    bodyBobHeight,
    handleTiltChange,
    legSwingAngle,
    maxWalkCycleSec,
    moveDurationMs,
    setBodyBobHeight,
    setLegSwingAngle,
    setMaxWalkCycleSec,
    setMoveDurationMs,
  } = useStageSliders()

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
      <label style={SLIDER_LABEL_STYLE}>
        歩行周期上限(s){' '}
        <input
          max={3}
          min={0.3}
          onChange={(event) => setMaxWalkCycleSec(Number(event.target.value))}
          step={0.05}
          type="range"
          value={maxWalkCycleSec}
        />{' '}
        {maxWalkCycleSec.toFixed(2)}s
      </label>
      <label style={SLIDER_LABEL_STYLE}>
        脚振り角(rad){' '}
        <input
          max={1.2}
          min={0}
          onChange={(event) => setLegSwingAngle(Number(event.target.value))}
          step={0.05}
          type="range"
          value={legSwingAngle}
        />{' '}
        {legSwingAngle.toFixed(2)}
      </label>
      <label style={SLIDER_LABEL_STYLE}>
        体の上下量{' '}
        <input
          max={0.3}
          min={0}
          onChange={(event) => setBodyBobHeight(Number(event.target.value))}
          step={0.01}
          type="range"
          value={bodyBobHeight}
        />{' '}
        {bodyBobHeight.toFixed(2)}
      </label>
    </div>
  )
}
