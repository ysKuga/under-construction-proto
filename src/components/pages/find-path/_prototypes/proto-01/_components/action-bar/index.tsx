import { useState } from 'react'

import {
  jumpAction,
  useBoxBotActionDispatcher,
} from '@/components/theater/figure/box-bot'
import { PLAYER_ACTOR_ID } from '@/prototypes/stage/stage-06/constants'
import { useGameClockStore } from '@/prototypes/time-control/time-control-03/_stores/game-clock'

import { useFindPathTick } from '../../_hooks/use-find-path-tick'
import { useJumpUnlock } from '../../_hooks/use-jump-unlock'
import { usePlannedPathSteps } from '../../_hooks/use-planned-path-steps'

type ActionBarProps = {
  /** player bot と共有する EventTarget（jump の発火 / `useJumpUnlock` の購読に使う） */
  eventTarget: EventTarget
}

/**
 * find-path の操作バー
 *
 * - 「ジャンプ」: player bot に jump action を発火する（`useBoxBotActionDispatcher`）。
 *   box-bot 本体クリックにしないのは、傾いた床上の 3D 空間で bot と
 *   `PlannedPathLayer` のクリック領域が奥行きにより競合するため（実機確認で確認済み）
 * - 「実行」: 予定経路を残り経路へコピーし tick 進行を開始する（`useFindPathTick`）。
 *   ジャンプ 3 回（`useJumpUnlock`）で解放するまで disabled。解放後は「ジャンプ」を隠す
 * - 「1 手戻す」: 予定経路の末尾を取り消す
 * - 速度スライダー: `timeScale` を game-clock store へ書き込む（0 でポーズ）。
 *   非制御。tick ドライバ側が store を購読して反映する
 */
export const ActionBar = (props: ActionBarProps) => {
  const { eventTarget } = props

  const { execute, reachedGoal } = useFindPathTick()
  const { popStep } = usePlannedPathSteps(PLAYER_ACTOR_ID)
  const setTimeScale = useGameClockStore((state) => state.setTimeScale)
  const { jump } = useBoxBotActionDispatcher(eventTarget, [jumpAction])

  const [executeUnlocked, setExecuteUnlocked] = useState(false)
  useJumpUnlock(eventTarget, setExecuteUnlocked)

  return (
    <div style={{ alignItems: 'center', display: 'flex', gap: 12 }}>
      {!executeUnlocked && (
        <button onClick={() => void jump()} type="button">
          ジャンプ
        </button>
      )}
      <button disabled={!executeUnlocked} onClick={execute} type="button">
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
      {!executeUnlocked && <span>ジャンプ 3 回で「実行」解放</span>}
      {reachedGoal && <span>🎉 ゴール到達</span>}
    </div>
  )
}
