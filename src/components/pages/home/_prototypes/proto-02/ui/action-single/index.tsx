import { Button } from '@/components/ui/button'

import { ACTION_LABELS } from '../_constants/action-labels'

/**
 * ActionSingle — 操作候補の先頭 1 件だけを表示する配置パターン
 *
 * - `ACTION_LABELS[0]` のみ表示する。挙動(制御ロジック)は接続しない(`../CLAUDE.md` 参照)
 */
export const ActionSingle = () => {
  const [label] = ACTION_LABELS

  return (
    <Button type="button" variant="outline">
      {label}
    </Button>
  )
}
