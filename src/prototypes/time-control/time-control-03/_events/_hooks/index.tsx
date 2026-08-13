import { useResetAllListener } from './use-reset-all-listener'

/**
 * scope 全体のイベント購読をまとめて有効化する
 *
 * - 新しい購読 (`use-xxx-listener`) を追加する際は、ここに呼び出しを足すだけでよい
 */
export const ScopeEventListeners = () => {
  useResetAllListener()

  return null
}
