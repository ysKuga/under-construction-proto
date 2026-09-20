import { useEnergyStore } from '@/components/pages/find-path/_prototypes/_stores/energy'
import { Button } from '@/components/ui/button'
import { PLAYER_ACTOR_ID } from '@/prototypes/stage/stage-06/constants'
import { useGameClockStore } from '@/prototypes/time-control/time-control-03/_stores/game-clock'
import { usePlannedPathStore } from '@/prototypes/time-control/time-control-03/_stores/planned-path'

import { useFindPathEventDispatcher } from '../../_events'
import { usePlannedPathSteps } from '../../_hooks/use-planned-path-steps'
import { useCarriedItemStore } from '../../_stores/carried-items'
import { useItemStore } from '../../_stores/items'
import { useTickStatusStore } from '../../_stores/tick-status'
import { RECOVERY_SPOT_CELLS } from '../../constants'

type ActionBarProps = {
  /** 「実行」。`useFindPathTick` から親経由で受け取る */
  execute: () => void
}

/**
 * find-path の操作バー
 *
 * - 「実行」: 予定経路を残り経路へコピーし tick 進行を開始する（`useFindPathTick`）。
 *   予定経路が空、または走行中は disabled
 * - 「1 手戻す」: 予定経路の末尾を取り消す。予定経路が空、または走行中は disabled
 * - 速度スライダー: `timeScale` を game-clock store へ書き込む（0 でポーズ）。
 *   非制御。tick ドライバ側が store を購読して反映する
 * - EN 残量表示: `EN: x/y`（画面表示のみ略称。実装識別子は `energy` のまま、issue #181）
 * - 「使用」: `FindPath-use-carried-item` イベントを dispatch する（実処理は
 *   `FindPathContent` が `useFindPathEventListener` 購読、issue #181）。携行数 0、
 *   または走行中は disabled
 * - 携行数表示: `携行: n/上限`。スタンド残り表示: `スタンド: n/初期在庫`（`RECOVERY_SPOT_CELLS`
 *   は現状1箇所のみのため単一表示。複数箇所になった場合は再設計が要る）
 * - `isRunning`/`reachedGoal` は `TickStatusStore` を直接 selector 購読する（props
 *   経由にすると値変更のたび親（`FindPathContent`）ごと再レンダリングされるため）
 */
export const ActionBar = (props: ActionBarProps) => {
  const { execute } = props

  const findPathEventDispatcher = useFindPathEventDispatcher()
  const useCarriedItem: () => void =
    findPathEventDispatcher['FindPath-use-carried-item']
  const { popStep } = usePlannedPathSteps(PLAYER_ACTOR_ID)
  const setTimeScale = useGameClockStore((state) => state.setTimeScale)
  const hasPlannedPath = usePlannedPathStore(
    (state) => state.getPlannedPath(PLAYER_ACTOR_ID).length > 0,
  )
  const energyInfo = useEnergyStore((state) =>
    state.getEnergyInfo(PLAYER_ACTOR_ID),
  )
  const carriedCount = useCarriedItemStore((state) => state.carriedItems.length)
  const carriedCapacity = useCarriedItemStore((state) => state.capacity)
  const spotStock = useItemStore((state) =>
    Object.values(state.itemsById).find((item) => item.stock !== undefined),
  )?.stock
  const isRunning = useTickStatusStore((state) => state.isRunning)
  const reachedGoal = useTickStatusStore((state) => state.reachedGoal)
  const editDisabled = !hasPlannedPath || isRunning

  return (
    <div style={{ alignItems: 'center', display: 'flex', gap: 12 }}>
      <Button disabled={editDisabled} onClick={execute} type="button">
        実行
      </Button>
      <Button
        disabled={editDisabled}
        onClick={popStep}
        type="button"
        variant="outline"
      >
        1 手戻す
      </Button>
      <label>
        速度{' '}
        <input
          defaultValue={1}
          max={4}
          min={0}
          onChange={(event) => {
            setTimeScale(Number(event.target.value))
          }}
          step={0.5}
          type="range"
        />
      </label>
      <span>
        EN: {energyInfo.current}/{energyInfo.max}
      </span>
      <span>
        携行: {carriedCount}/{carriedCapacity}
      </span>
      <Button
        disabled={isRunning || carriedCount === 0}
        onClick={useCarriedItem}
        type="button"
        variant="outline"
      >
        使用
      </Button>
      {spotStock !== undefined && (
        <span>
          スタンド: {spotStock}/{RECOVERY_SPOT_CELLS[0].stock}
        </span>
      )}
      {reachedGoal && <span>🎉 ゴール到達</span>}
    </div>
  )
}
