import { createPropsContext } from '@/utils/create-props-context'

import { TimeControl03Props } from './index.types'

const { Provider, useProps } =
  createPropsContext<TimeControl03Props>('TimeControl03')

/** TimeControl03 props 配布用 Provider */
export const TimeControl03PropsProvider = Provider

/** TimeControl03 props を取得する */
export const useTimeControl03Props = (): TimeControl03Props => useProps()
