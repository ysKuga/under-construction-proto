'use client'

import { useStage07HandleRef } from '@/components/pages/expedition/_stage-components/hex-stage/_contexts/stage07-handle'

import { useDisplaySettingsStore } from '../../../../_stores/display-settings'
import { INITIAL_TILT_DEG, SLIDER_LABEL_STYLE } from '../../../../constants'

/**
 * ステージの調整スライダー（tilt・移動時間・歩行周期上限・脚振り角・体の上下量）
 *
 * - tilt は `Stage07Handle.setTilt` で床へ直接反映する（再レンダリングなし）
 * - tilt 以外は `display-settings` store へ書き込み、stage content が購読して `Stage07` へ渡す
 */
export const StageSliders = () => {
  const stage07HandleRef = useStage07HandleRef()
  /** セル間移動アニメーションの所要時間(ms) */
  const moveDurationMs = useDisplaySettingsStore(
    (state) => state.moveDurationMs,
  )
  const setMoveDurationMs = useDisplaySettingsStore(
    (state) => state.setMoveDurationMs,
  )
  /** walking の脚振り周期の上限(秒) */
  const maxWalkCycleSec = useDisplaySettingsStore(
    (state) => state.maxWalkCycleSec,
  )
  const setMaxWalkCycleSec = useDisplaySettingsStore(
    (state) => state.setMaxWalkCycleSec,
  )
  /** walking の脚振り角の振幅(rad) */
  const legSwingAngle = useDisplaySettingsStore((state) => state.legSwingAngle)
  const setLegSwingAngle = useDisplaySettingsStore(
    (state) => state.setLegSwingAngle,
  )
  /** 歩行中の体の上下の最大持ち上げ量(world) */
  const bodyBobHeight = useDisplaySettingsStore((state) => state.bodyBobHeight)
  const setBodyBobHeight = useDisplaySettingsStore(
    (state) => state.setBodyBobHeight,
  )

  return (
    <div>
      <label style={SLIDER_LABEL_STYLE}>
        tilt{' '}
        <input
          defaultValue={INITIAL_TILT_DEG}
          max={85}
          min={0}
          onChange={(event) => {
            stage07HandleRef.current?.setTilt(Number(event.target.value))
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
