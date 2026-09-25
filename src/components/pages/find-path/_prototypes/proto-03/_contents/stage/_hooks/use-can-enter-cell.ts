import { useCallback, useMemo } from 'react'

import { useEnergyStore } from '@/components/pages/find-path/_prototypes/_stores/energy'
import { PLAYER_ACTOR_ID } from '@/prototypes/stage/stage-06/constants'
import { HexCell } from '@/prototypes/stage/stage-07/_lib/hex'
import { useActorsStore } from '@/prototypes/stage/stage-07/_stores/actors'

import { isObstacleCell } from '../../../_lib/obstacle'
import { isBlockedByOneWay } from '../../../_lib/one-way'
import { EnterGuard, UseStageReturn } from '../index.types'

/**
 * 進入可否判定（EN 残量込み/抜きの2種）を返す
 *
 * - 進入拒否条件一覧（`EnterGuard`）は EN 残量チェックを含まない。EN 残量チェックは
 *   `MoveTargetLayer` 自身が EN store を直接購読して適用する（issue-181-en backlog:
 *   `EnergyDebugPanel` 操作で `Stage07` 配下ツリー全体が再レンダリングされる問題の解消）
 * - EN は残量の有無（boolean）のみ購読する。残量の増減だけでは再レンダリングしない
 */
export const useCanEnterCell = (): Pick<
  UseStageReturn,
  'canEnterCell' | 'canEnterCellPerceived'
> => {
  const currentCell = useActorsStore((state) => state.actors[PLAYER_ACTOR_ID])
  /** EN 残量があるか */
  const hasEnergy = useEnergyStore(
    (state) => state.getEnergyInfo(PLAYER_ACTOR_ID).current > 0,
  )

  const enterGuards: EnterGuard[] = useMemo(
    () => [
      { check: (cell) => !isObstacleCell(cell), kind: 'perceived' },
      {
        check: (cell) => !isBlockedByOneWay(currentCell, cell),
        kind: 'perceived',
      },
    ],
    [currentCell],
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
