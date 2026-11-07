import { ReactNode } from 'react'
import { StoreApi } from 'zustand/vanilla'

/**
 * 選択肢パネルへ登録する選択肢 1 つ
 *
 * - 選択時の処理は持たない。選択は `Expedition-choice-select` で各機能へ届く
 */
export type ChoiceEntry = {
  /** 選択肢の識別子。選択の event（`Expedition-choice-select`）で届く */
  id: string
  /** 表示する文言 */
  label: ReactNode
  /** 並び順（小さいほど先） */
  order: number
  /** 押下中の表示にするか（`aria-pressed`）。未指定なら押下の状態を持たない */
  pressed?: boolean
}

/** 選択肢パネルへ並べる選択肢を保持する store */
export type ChoicesState = {
  /** 登録済みの選択肢（`order` 順） */
  choices: ChoiceEntry[]
  /**
   * 選択肢を登録する。同じ id があれば置き換える
   *
   * @param choice 登録する選択肢
   */
  register: (choice: ChoiceEntry) => void
  /**
   * 選択肢の登録を外す
   *
   * @param id 外す選択肢の識別子
   */
  unregister: (id: ChoiceEntry['id']) => void
}

export type ChoicesStore = StoreApi<ChoicesState>
