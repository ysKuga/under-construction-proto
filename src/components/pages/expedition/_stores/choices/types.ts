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
  choices: RegisteredChoice[]
  /**
   * 選択肢を登録する。同じ id があれば置き換える（通し番号も振り直す）
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

/** 選択肢パネルへ並べる選択肢の store */
export type ChoicesStore = StoreApi<ChoicesState>

/** 登録済みの選択肢 */
export type RegisteredChoice = {
  /**
   * 登録の通し番号。登録し直すたびに変わる
   *
   * - パネルは前回と同じ登録が 1 つも残らない時に開く（目標の再設定等で登録し直した時も開く）
   */
  serial: number
} & ChoiceEntry
