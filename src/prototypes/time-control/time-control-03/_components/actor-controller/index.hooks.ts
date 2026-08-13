import { useFixedPathSetting } from './_hooks/use-fixed-path-setting'
import { usePositionInfo } from './_hooks/use-position-info'
import { useTargetDispatch } from './_hooks/use-target-dispatch'
import { useTickSetting } from './_hooks/use-tick-setting'
import { ActorControllerProps, UseActorControllerReturn } from './index.types'

/**
 * ActorController の操作ロジック
 *
 * @param props ActorController に渡される props
 */
export const useActorController = (
  props: ActorControllerProps,
): UseActorControllerReturn => {
  const { intentTarget, path, position } = usePositionInfo(props)
  const { setTickMsOption, tickMs } = useTickSetting(props)
  const {
    fixedPathSteps,
    isFixedPathSteps,
    setFixedPathSteps,
    setIsFixedPathSteps,
  } = useFixedPathSetting(props)
  const { dispatchTarget } = useTargetDispatch(props)

  const etaMs = path.length * tickMs

  return {
    dispatchTarget,
    etaMs,
    fixedPathSteps,
    intentTarget,
    isFixedPathSteps,
    path,
    position,
    setFixedPathSteps,
    setIsFixedPathSteps,
    setTickMsOption,
    tickMs,
  }
}
