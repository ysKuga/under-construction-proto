import { useState } from 'react'

import { useTimeControl03EventDispatcher } from '../../../../_events'

/**
 * AsyncSampleButton の操作ロジック
 */
export const useAsyncSampleButton = () => {
  const timeControl03EventDispatcher = useTimeControl03EventDispatcher()
  const [isDispatching, setIsDispatching] = useState(false)

  const dispatchAsyncSample = async () => {
    setIsDispatching(true)
    await timeControl03EventDispatcher['async-sample']()
    setIsDispatching(false)
  }

  return { dispatchAsyncSample, isDispatching }
}
