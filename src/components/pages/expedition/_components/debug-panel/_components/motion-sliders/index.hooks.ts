import { useDisplaySettingsStore } from '../../../../_stores/display-settings'

import { UseMotionSlidersReturn } from './index.types'

/** 歩行モーションの調整スライダーの表示値・操作を store から集める */
export const useMotionSliders = (): UseMotionSlidersReturn => {
  const maxWalkCycleSec = useDisplaySettingsStore(
    (state) => state.maxWalkCycleSec,
  )
  const setMaxWalkCycleSec = useDisplaySettingsStore(
    (state) => state.setMaxWalkCycleSec,
  )
  const legSwingAngle = useDisplaySettingsStore((state) => state.legSwingAngle)
  const setLegSwingAngle = useDisplaySettingsStore(
    (state) => state.setLegSwingAngle,
  )
  const bodyBobHeight = useDisplaySettingsStore((state) => state.bodyBobHeight)
  const setBodyBobHeight = useDisplaySettingsStore(
    (state) => state.setBodyBobHeight,
  )

  return {
    bodyBobHeight,
    legSwingAngle,
    maxWalkCycleSec,
    setBodyBobHeight,
    setLegSwingAngle,
    setMaxWalkCycleSec,
  }
}
