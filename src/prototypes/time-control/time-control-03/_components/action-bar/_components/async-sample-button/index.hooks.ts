import {
  useTimeControl03EventDispatcher,
  useTimeControl03EventPending,
} from '../../../../_events'

/**
 * AsyncSampleButton の操作ロジック
 */
export const useAsyncSampleButton = () => {
  const timeControl03EventDispatcher = useTimeControl03EventDispatcher()
  const { isPending: isDispatching } = useTimeControl03EventPending(
    'TimeControl03-async-sample',
  )

  const dispatchAsyncSample = () => {
    // timeControl03EventListener\('TimeControl03-async-sample'
    timeControl03EventDispatcher['TimeControl03-async-sample']()
  }

  return { dispatchAsyncSample, isDispatching }
}
