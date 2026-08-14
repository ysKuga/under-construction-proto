import { useTimeControl03EventListener } from '../../_hooks/use-time-control-03-event-listener'

const SAMPLE_DELAY_MS = 800

/**
 * async-sample イベントを購読し、疑似 async 処理を実行する
 *
 * - `event-async-pending` steering の実演用サンプル。store は使わず、listener 内で\
 *   Promise + setTimeout による遅延処理のみ完結させる (実際の API 呼出等は行わない)
 */
export const useAsyncSampleEventListener = () => {
  useTimeControl03EventListener('async-sample', async () => {
    await new Promise<void>((resolve) => {
      setTimeout(resolve, SAMPLE_DELAY_MS)
    })
  })
}
