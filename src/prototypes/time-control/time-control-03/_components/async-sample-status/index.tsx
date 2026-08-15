import { useTimeControl03EventPending } from '../../_events'

/**
 * `TimeControl03-async-sample` event の pending 状態を、発行元 (`AsyncSampleButton`) とは\
 * 独立に観測する検証用コンポーネント
 *
 * - `useEventListener` レベルの pending 観測機構 (`useEventPending`) の実演
 */
export const AsyncSampleStatus = () => {
  const { isPending } = useTimeControl03EventPending(
    'TimeControl03-async-sample',
  )

  return (
    <p className="text-gray-400">
      async-sample: {isPending ? 'pending...' : 'idle'}
    </p>
  )
}
