import { getTickMs } from '../../../../time-control-02/_lib/get-tick-ms'
import { useTimeControl03EventDispatcher } from '../../../_events'
import { useActorStore } from '../../../_stores'
import { ActorControllerProps, UseActorControllerReturn } from '../index.types'

/** tick 選択肢 (50ms 刻み、50〜500ms) */
export const TICK_MS_OPTIONS = Array.from(
  { length: 10 },
  (_, index) => (index + 1) * 50,
)

/**
 * actor の tick 時間取得・設定
 *
 * @param props ActorController に渡される props
 */
export const useTickSetting = (
  props: ActorControllerProps,
): Pick<UseActorControllerReturn, 'setTickMsOption' | 'tickMs'> => {
  const { id } = props

  const tickRate = useActorStore((state) => state.getActorInfo(id).tickRate)
  const tickMs = getTickMs(tickRate)
  const timeControl03EventDispatcher = useTimeControl03EventDispatcher()

  const setTickMsOption: UseActorControllerReturn['setTickMsOption'] = (
    value,
  ) => {
    // timeControl03EventListener\('TimeControl03-set-tick-ms'
    timeControl03EventDispatcher['TimeControl03-set-tick-ms']({
      actorId: id,
      tickMs: value,
    })
  }

  return { setTickMsOption, tickMs }
}
