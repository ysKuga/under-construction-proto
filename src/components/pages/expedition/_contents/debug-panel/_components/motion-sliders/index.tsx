'use client'

import { SLIDER_LABEL_STYLE } from '../../../../constants'

import { useMotionSliders } from './index.hooks'

/**
 * 歩行モーションの調整スライダー（歩行周期上限・脚振り角・体の上下量）
 *
 * - `display-settings` store へ書き込み、stage content が購読して `Stage07` へ渡す
 */
export const MotionSliders = () => {
  const {
    bodyBobHeight,
    legSwingAngle,
    maxWalkCycleSec,
    setBodyBobHeight,
    setLegSwingAngle,
    setMaxWalkCycleSec,
  } = useMotionSliders()

  return (
    <>
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
    </>
  )
}
