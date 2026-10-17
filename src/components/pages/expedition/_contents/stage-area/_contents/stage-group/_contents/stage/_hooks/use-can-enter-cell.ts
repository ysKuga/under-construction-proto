import { useCallback, useMemo } from 'react'

import { useEnergyStore } from '@/components/pages/expedition/_stores/energy'
import { PLAYER_ACTOR_ID } from '@/components/pages/expedition/_stage-components/hex-stage/constants'
import { HexCell } from '@/components/pages/expedition/_stage-components/hex-stage/_lib/hex'
import { useActorsStore } from '@/components/pages/expedition/_stage-components/hex-stage/_stores/actors'

import { useStageLayout } from '../../../../../../../_contexts/stage-layout'
import { isObstacleCell } from '../../../../../../../_lib/obstacle'
import { isBlockedByOneWay } from '../../../../../../../_lib/one-way'
import { useGamePhaseStore } from '../../../../../../../_stores/game-phase'
import { EnterGuard, UseStageReturn } from '../index.types'

/**
 * 進入可否判定（EN 残量込み/抜きの2種）を返す
 *
 * - 進入拒否条件一覧（`EnterGuard`）は EN 残量チェックを含まない。EN 残量チェックは
 *   `MoveTargetLayer` 自身が EN store を直接購読して適用する（issue-181-en backlog:
 *   `EnergyDebugPanel` 操作で `Stage07` 配下ツリー全体が再レンダリングされる問題の解消）
 * - EN は残量の有無（boolean）のみ購読する。残量の増減だけでは再レンダリングしない
 * - ゴール到達後は全セル進入不可（終了状態）。自動移動も次のマスで打ち切られ、\
 *   移動可能マスも表示しない
 */
export const useCanEnterCell = (): Pick<
  UseStageReturn,
  'canEnterCell' | 'canEnterCellPerceived'
> => {
  const currentCell = useActorsStore((state) => state.actors[PLAYER_ACTOR_ID])
  const stageLayout = useStageLayout()
  /** EN 残量があるか */
  const hasEnergy = useEnergyStore(
    (state) => state.getEnergyInfo(PLAYER_ACTOR_ID).current > 0,
  )

  /** セルへの進入を許可するフェーズか（ゴール後の終了状態では移動させない） */
  const enterCellAllowed = useGamePhaseStore((state) =>
    state.allows('enterCell'),
  )

  const enterGuards = useMemo<EnterGuard[]>(
    () => [
      {
        check: () => enterCellAllowed,
        kind: 'perceived',
      },
      {
        check: (cell) => !isObstacleCell(cell, stageLayout),
        kind: 'perceived',
      },
      {
        check: (cell) => !isBlockedByOneWay(currentCell, cell, stageLayout),
        kind: 'perceived',
      },
    ],
    [currentCell, enterCellAllowed, stageLayout],
  )

  const canEnterCellPerceived = useCallback(
    (cell: HexCell) =>
      enterGuards
        .filter((guard) => guard.kind === 'perceived')
        .every((guard) => guard.check(cell)),
    [enterGuards],
  )

  const canEnterCell = useCallback(
    (cell: HexCell) => canEnterCellPerceived(cell) && hasEnergy,
    [canEnterCellPerceived, hasEnergy],
  )

  return { canEnterCell, canEnterCellPerceived }
}
