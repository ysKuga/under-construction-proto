import { PLAYER_ACTOR_ID } from '@/prototypes/stage/stage-06/constants'
import { useGameClockStore } from '@/prototypes/time-control/time-control-03/_stores/game-clock'

import { useFindPathTick } from '../../_hooks/use-find-path-tick'
import { usePlannedPathSteps } from '../../_hooks/use-planned-path-steps'

/**
 * find-path の操作バー
 *
 * - 「実行」: 予定経路を残り経路へコピーし tick 進行を開始する（`useFindPathTick`）
 * - 「1 手戻す」: 予定経路の末尾を取り消す
 * - 速度スライダー: `timeScale` を game-clock store へ書き込む（0 でポーズ）。
 *   非制御。tick ドライバ側が store を購読して反映する
 */
export const ActionBar = () => {
  const { execute } = useFindPathTick()
  const { popStep } = usePlannedPathSteps(PLAYER_ACTOR_ID)
  const setTimeScale = useGameClockStore((state) => state.setTimeScale)

  return (
    <div style={{ alignItems: 'center', display: 'flex', gap: 12 }}>
      <button onClick={execute} type="button">
        実行
      </button>
      <button onClick={popStep} type="button">
        1 手戻す
      </button>
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
    </div>
  )
}
