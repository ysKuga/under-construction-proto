import { useState } from 'react'

import { UseStandaloneBotReturn } from '../index.types'

/** 独立 bot の EventTarget を生成する（中継先） */
export const useStandaloneBotEventTarget = (): Pick<
  UseStandaloneBotReturn,
  'standaloneBotEventTarget'
> => {
  const [standaloneBotEventTarget] = useState<EventTarget>(
    () => new EventTarget(),
  )

  return { standaloneBotEventTarget }
}
