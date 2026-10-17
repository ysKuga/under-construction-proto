import { RefObject } from 'react'

import { ExecuteBubbleHandle } from '../../../../_components/execute-bubble'

export type UseExecuteBubbleContentReturn = {
  /** `ExecuteBubble` の imperative API。半透明化を ref 経由で命令する */
  executeBubbleRef: RefObject<ExecuteBubbleHandle | null>
  /** 「実行」吹き出しクリック時。表示中の経路に沿って自動移動を開始する */
  handleClick: () => Promise<void>
  /**
   * 「実行」吹き出しの close ボタン(×)クリック時
   *
   * - 目標設定をキャンセルし通常状態へ戻す（中継点選択中も含め一括。ESC の段階的な戻りとは異なる）
   */
  handleClose: () => void
}
