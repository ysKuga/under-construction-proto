import { usePlayerActivityStoreApi } from '../../../_stores/player-activity'
import { useFindPathEventListener } from '../../_hooks/use-find-path-event-listener'

/**
 * 経路の提示・実行を、EN スポットで補給中なら拒否する
 *
 * - 補給は移動と同じく完了まで時間を経過させる行為とし、その間は他の操作を受け付けない\
 *   （issue #297）
 * - EN 判定（`useEnergyPathGuardEventListener`）と同じイベントを `allowMultiple` で購読する
 */
export const useRecoveringPathGuardEventListener = () => {
  const playerActivityStoreApi = usePlayerActivityStoreApi()

  /** 補給中なら拒否する */
  const guard = (event: Event) => {
    if (playerActivityStoreApi.getState().activity === 'recovering') {
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
