import { Button } from '@/components/ui/button'

import { useActionBar } from './index.hooks'

/**
 * 全 actor 一括の操作パネル
 *
 * - 行動決定: 個別 actor の企図をまとめて実行する
 * - mode: 進行モード (auto/manual) を全 actor 一括で切り替える。\
 *   actor ごとの個別切り替えは廃止、常に全員同一モードで揃える
 * - reset: 全 store (状態を持たない intent-store 以外) を初期状態に戻す
 */
export const ActionBar = () => {
  const { dispatchDecision, progressMode, resetAll, toggleProgressMode } =
    useActionBar()

  return (
    <div className="flex gap-2 p-2">
      <Button onClick={dispatchDecision} type="button">
        行動決定
      </Button>
      <Button onClick={toggleProgressMode} type="button" variant="outline">
        mode: {progressMode}
      </Button>
      <Button onClick={resetAll} type="button" variant="destructive">
        reset
      </Button>
    </div>
  )
}
