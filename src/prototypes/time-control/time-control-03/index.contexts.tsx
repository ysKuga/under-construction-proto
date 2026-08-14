import { createPropsContext } from '@/utils/create-props-context'

import { TimeControl03Props } from './index.types'

export const {
  Provider: TimeControl03PropsProvider,
  useProps: useTimeControl03Props,
} = createPropsContext<TimeControl03Props>('TimeControl03')
