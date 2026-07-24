import { useReducer } from 'react'

import { reducePointerState } from '../reduce-pointer-state'
import { EventLog, PointerRawEventType, PointerTransition } from '../types'

type PointerStateWithLog = {
  eventLog: EventLog<PointerRawEventType>
  transition: PointerTransition
}

const initialState: PointerStateWithLog = {
  eventLog: [],
  transition: { nextState: 'idle' },
}

const reducer = (
  state: PointerStateWithLog,
  event: PointerRawEventType,
): PointerStateWithLog => ({
  eventLog: [...state.eventLog, { event, time: Date.now() }],
  transition: reducePointerState(state.transition.nextState, event),
})

/**
 * PointerState を管理する hook
 *
 * - click/drop 判定結果は transition.resolved に都度反映される (dispatch 毎に新規オブジェクト)
 * - 呼び出し側で transition.resolved を監視し、必要な副作用 (drop 処理など) を実行する
 * - eventLog は受け取った生イベントの時系列記録 (破棄しない持ち越し型)
 */
export const usePointerState = (): {
  /** 生イベントを流し込む */
  dispatch: (event: PointerRawEventType) => void
  /** 受け取った生イベントの時系列記録 */
  eventLog: EventLog<PointerRawEventType>
  /** 現在の状態と直近の判定結果 */
  transition: PointerTransition
} => {
  const [state, dispatch] = useReducer(reducer, initialState)

  return { dispatch, eventLog: state.eventLog, transition: state.transition }
}
