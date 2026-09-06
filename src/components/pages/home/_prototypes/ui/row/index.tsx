import { Button } from '@/components/ui/button'

import { ACTION_LABELS } from '../_constants/action-labels'

/**
 * Row — 操作要素を横一列に並べる配置パターン
 *
 * - 挙動(制御ロジック)は接続しない。配置・常時表示の見た目のみ確認する(`../CLAUDE.md` 参照)
 */
export const Row = () => {
  return (
    <div className="flex gap-2">
      {ACTION_LABELS.map((label) => (
        <Button key={label} type="button" variant="outline">
          {label}
        </Button>
      ))}
    </div>
  )
}
