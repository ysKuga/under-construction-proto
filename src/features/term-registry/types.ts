/**
 * 用語1件の情報
 *
 * - ゲーム内・システム内で使用する用語の情報を集約する（issue #284）
 */
export type Term = {
  /** 略称（UI 表示など省スペースが必要な箇所で使用、例: EN） */
  abbreviation?: string
  /** 表示用 className（`ui-term-` + 英語名称） */
  className: string
  /** 表示絵文字（画像の代用） */
  emoji?: string
  /** 英語名称（kebab-case、用語ディレクトリ名と一致） */
  englishName: string
  /** 名称 */
  name: string
}
