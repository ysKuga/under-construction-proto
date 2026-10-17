import { BubbleSlotEntry } from '../_stores/bubble-slots/types'

/**
 * 種類による排他を適用し、吹き出しごとに実際に表示するかを求める
 *
 * - 表示条件を満たす吹き出しの `hides` に含まれる種類を持つ吹き出しは非表示にする
 * - 他の吹き出しを隠すかは、排他適用前の表示条件で判定する（隠し合う指定でも循環しない）
 *
 * @param bubbles 格納する吹き出し
 * @param visibility 吹き出しの識別子ごとの表示条件。未登録の識別子は非表示
 */
export const resolveVisibility = (
  bubbles: readonly Pick<BubbleSlotEntry, 'hides' | 'id' | 'kinds'>[],
  visibility: Record<string, boolean>,
): Record<string, boolean> => {
  /** 表示条件を満たす吹き出しが隠す種類 */
  const hiddenKinds = new Set(
    bubbles.flatMap(({ hides = [], id }) => (visibility[id] ? hides : [])),
  )

  return Object.fromEntries(
    bubbles.map(({ id, kinds = [] }) => [
      id,
      (visibility[id] ?? false) && !kinds.some((kind) => hiddenKinds.has(kind)),
    ]),
  )
}
