import { useEnergyStoreApi } from '@/components/pages/find-path/_prototypes/_stores/energy'
import { PLAYER_ACTOR_ID } from '@/prototypes/stage/stage-06/constants'

import { useFindPathEventListener } from '../../_hooks/use-find-path-event-listener'

/**
 * 経路の提示・実行を EN 残量で判定し、EN 切れなら拒否する
 *
 * - 残量 0 以下なら `preventDefault()` し、dispatcher の戻り値を `false` にする。\
 *   UI 側は EN を知らず、戻り値だけで実行を取りやめる（ui-jurisdiction 案 1）
 * - 今後ほかの要素も同じイベントで判定できるよう `allowMultiple` で購読する
 */
export const useEnergyPathGuardEventListener = () => {
  const energy = useEnergyStoreApi()

  /** EN 切れなら拒否する */
  const guard = (event: Event) => {
    if (energy.getState().getEnergyInfo(PLAYER_ACTOR_ID).current <= 0) {
      event.preventDefault()
    }
  }

  useFindPathEventListener('FindPath-propose-path', guard, {
    allowMultiple: true,
  })
  useFindPathEventListener('FindPath-execute-path', guard, {
    allowMultiple: true,
  })
}
