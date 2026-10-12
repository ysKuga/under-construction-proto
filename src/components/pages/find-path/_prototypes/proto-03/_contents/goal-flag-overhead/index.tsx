'use client'

import { motion } from 'motion/react'
import { createPortal } from 'react-dom'

import { PLAYER_ACTOR_ID } from '@/prototypes/stage/stage-06/constants'
import { useActorsStore } from '@/prototypes/stage/stage-07/_stores/actors'

import { BOT_SIZE } from '../../constants'
import { useGoalStore } from '../../_stores/goal'

/** 旗の上昇後の位置（bot 上端からの y。px） */
const FLAG_OVERHEAD_Y = -20

/** 旗が bot 位置から頭上へ上昇する時間（秒） */
const FLAG_RISE_DURATION_S = 0.6

/**
 * ゴール到達時、旗を bot の頭上へ表示する
 *
 * - 床上の旗（`GoalMarkerLayer`）が bot に重なるのを避け、到達を旗の上昇で示す（issue #137）
 * - bot 頭上のオーバーレイコンテナ（`overlayContainers[PLAYER_ACTOR_ID]`）へ `createPortal`
 *   で注入する。コンテナの原点は bot の左上
 * - bot がゴールセルの中心へ着いた時点（`flagRaised`）で表示し、bot の中心から頭上へ上昇する。\
 *   到達判定（`reached`）はセル進入時のため、そこで表示すると bot の移動中に上昇してしまう
 * - リセットで goal store が作り直され、未到達へ戻ると表示しない
 */
export const GoalFlagOverhead = () => {
  const flagRaised = useGoalStore((state) => state.flagRaised)
  const overlayContainer = useActorsStore(
    (state) => state.overlayContainers[PLAYER_ACTOR_ID],
  )

  if (!flagRaised || !overlayContainer) return null

  return createPortal(
    <motion.div
      animate={{ y: FLAG_OVERHEAD_Y }}
      initial={{ y: BOT_SIZE / 2 }}
      style={{
        fontSize: 20,
        left: BOT_SIZE / 2,
        position: 'absolute',
        top: 0,
        translateX: '-50%',
        translateY: '-50%',
      }}
      transition={{ duration: FLAG_RISE_DURATION_S, ease: 'easeOut' }}
    >
      🚩
    </motion.div>,
    overlayContainer,
  )
}
