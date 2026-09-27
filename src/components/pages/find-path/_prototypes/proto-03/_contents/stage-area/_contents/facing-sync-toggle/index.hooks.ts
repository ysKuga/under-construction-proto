import { useCallback } from 'react'

import { useDisplaySettingsStore } from '../../../../_stores/display-settings'

/** 向き同期トグルの表示値・操作 */
export type UseFacingSyncToggleReturn = {
  /** 独立 bot（状態表示）の向きをステージ上の bot と同期するか */
  syncStandaloneBotFacing: boolean
  /** 同期 ⇔ 固定を切り替える */
  toggleSyncStandaloneBotFacing: () => void
}

/** 独立 bot の向き同期設定を購読し、切替操作を返す */
export const useFacingSyncToggle = (): UseFacingSyncToggleReturn => {
  const syncStandaloneBotFacing = useDisplaySettingsStore(
    (state) => state.syncStandaloneBotFacing,
  )
  const setSyncStandaloneBotFacing = useDisplaySettingsStore(
    (state) => state.setSyncStandaloneBotFacing,
  )

  const toggleSyncStandaloneBotFacing = useCallback(() => {
    setSyncStandaloneBotFacing(!syncStandaloneBotFacing)
  }, [setSyncStandaloneBotFacing, syncStandaloneBotFacing])

  return { syncStandaloneBotFacing, toggleSyncStandaloneBotFacing }
}
