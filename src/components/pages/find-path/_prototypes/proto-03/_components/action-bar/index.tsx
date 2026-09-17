import { useEnergyStore } from '@/components/pages/find-path/_prototypes/_stores/energy'
import { Button } from '@/components/ui/button'
import { PLAYER_ACTOR_ID } from '@/prototypes/stage/stage-06/constants'
import { useGameClockStore } from '@/prototypes/time-control/time-control-03/_stores/game-clock'
import { usePlannedPathStore } from '@/prototypes/time-control/time-control-03/_stores/planned-path'

import { usePlannedPathSteps } from '../../_hooks/use-planned-path-steps'

type ActionBarProps = {
  /** 「実行」。`useFindPathTick` から親経由で受け取る */
  execute: () => void
  /** tick 走行中か。走行中は「実行」「1 手戻す」を disabled にする */
  isRunning: boolean
  /** bot が `GOAL_POSITION` に到達済みか */
  reachedGoal: boolean
}

/**
 * find-path proto-03（hex）の操作バー（proto-01 `ActionBar` と同内容）
 *
 * - 「実行」: 予定経路を残り経路へコピーし tick 進行を開始する（`useFindPathTick`）。
 *   予定経路が空、または走行中は disabled
 * - 「1 手戻す」: 予定経路の末尾を取り消す。予定経路が空、または走行中は disabled
 * - 速度スライダー: `timeScale` を game-clock store へ書き込む（0 でポーズ）
 * - EN 残量表示: `EN: x/y`（画面表示のみ略称。実装識別子は `energy` のまま、issue #181）
 */
export const ActionBar = (props: ActionBarProps) => {
  const { execute, isRunning, reachedGoal } = props

  const { popStep } = usePlannedPathSteps(PLAYER_ACTOR_ID)
  const setTimeScale = useGameClockStore((state) => state.setTimeScale)
  const hasPlannedPath = usePlannedPathStore(
    (state) => state.getPlannedPath(PLAYER_ACTOR_ID).length > 0,
  )
  const energyInfo = useEnergyStore((state) =>
    state.getEnergyInfo(PLAYER_ACTOR_ID),
  )
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
      {reachedGoal && <span>🎉 ゴール到達</span>}
    </div>
  )
}
