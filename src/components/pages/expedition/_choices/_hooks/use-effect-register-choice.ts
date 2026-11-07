import { useEffect } from 'react'

import { useChoicesStoreApi } from '../../_stores/choices'
import { ChoiceEntry } from '../../_stores/choices/types'

/**
 * 選択肢を表示中のみ選択肢パネルへ登録する
 *
 * - 選択肢が変わったら登録し直し、`undefined`（非表示）・unmount で登録を外す
 * - 呼び出し側は選択肢を `useMemo` で保つ。毎描画で別の値を渡すと登録し直しが続く
 *
 * @param choice 登録する選択肢。非表示なら `undefined`
 */
export const useEffectRegisterChoice = (choice: ChoiceEntry | undefined) => {
  /** 選択肢の store（登録・解除に使う） */
  const choicesStoreApi = useChoicesStoreApi()

  useEffect(() => {
    // 表示中の選択肢を登録し、非表示・変更・unmount で外す
    if (!choice) return

    choicesStoreApi.getState().register(choice)

    return () => choicesStoreApi.getState().unregister(choice.id)
  }, [choice, choicesStoreApi])
}
