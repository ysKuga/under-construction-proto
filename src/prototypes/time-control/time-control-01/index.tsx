import { useCallback } from 'react'

import { usePointerState } from './_hooks/use-pointer-state'
import { PointerRawEventType } from './types'

/**
 * PointerState 遷移のデモ
 *
 * - 単一要素の focus/blur/mousedown/mouseup を usePointerState に流し込み、\
 *   click/drop 判定結果を表示する
 */
export const TimeControl01 = () => {
  const { dispatch, eventLog, transition } = usePointerState()

  const handle = useCallback(
    (event: PointerRawEventType) => () => dispatch(event),
    [dispatch],
  )

  return (
    <div className="ui-container">
      <button
        onBlur={handle('focusout')}
        onFocus={handle('focus')}
        onMouseDown={handle('mousedown')}
        onMouseUp={handle('mouseup')}
        type="button"
      >
        pointer target
      </button>
      <p>state: {transition.nextState}</p>
      <p>resolved: {transition.resolved ?? '-'}</p>
      <ul>
        {eventLog.map((entry, index) => (
          <li key={index}>
            {new Date(entry.time).toLocaleTimeString()} {entry.event}
          </li>
        ))}
      </ul>
    </div>
  )
}
