import { useEffect, useState } from 'react'

import { getPendingPromises, subscribePendingChange } from '../_registries'

/**
 * useEventPending のオプション
 */
export type UseEventPendingOptions = {
  /** 監視対象。省略時 window */
  target?: EventTarget
}

/**
 * target・type の handler が現在 Promise 実行中かどうかを観測する
 *
 * - `useEventListener` 自体は呼ばない (実 listener を追加登録しない)。既存の\
 *   実 listener (別の `useEventListener` 呼出) が持つ実行中 Promise の有無を\
 *   registry 経由で覗くだけ
 * - イベント名には scope prefix (例: `ComponentName-`) の付与を検討する(grep 検索性のため)
 *
 * @param type イベント名
 * @param options 監視対象の指定
 */
export const useEventPending = (
  type: string,
  options: UseEventPendingOptions = {},
) => {
  const { target = window } = options

  const [isPending, setIsPending] = useState(
    () => getPendingPromises(target, type).length > 0,
  )

  useEffect(() => {
    setIsPending(getPendingPromises(target, type).length > 0)

    return subscribePendingChange(target, type, () => {
      setIsPending(getPendingPromises(target, type).length > 0)
    })
  }, [target, type])

  return { isPending }
}
