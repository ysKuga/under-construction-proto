import { MOVE_HISTORY_DISPLAY_LIMIT, toMoveHistoryView } from './index.hooks'

describe('toMoveHistoryView', () => {
  it('手数はリセットを数えず、一覧は新しい順に並べる', () => {
    expect(
      toMoveHistoryView([
        { kind: 'move', path: [{ q: 1, r: 0 }] },
        { kind: 'reset' },
        {
          kind: 'move',
          path: [
            { q: 1, r: 1 },
            { q: 1, r: 2 },
          ],
        },
      ]),
    ).toEqual({
      moveCount: 2,
      rows: [
        { key: 2, label: '2手目: (1, 2) へ 2 マス' },
        { key: 1, label: 'リセット' },
        { key: 0, label: '1手目: (1, 0) へ 1 マス' },
      ],
    })
  })

  it('アクションの結果を手数に数えず表示する', () => {
    expect(
      toMoveHistoryView([
        { itemKind: 'energy-charge', kind: 'pick-up-item' },
        { itemKind: 'energy-charge', kind: 'use-item' },
        { kind: 'use-energy-spot' },
        { kind: 'energy-depleted' },
        { kind: 'reach-goal' },
      ]),
    ).toEqual({
      moveCount: 0,
      rows: [
        { key: 4, label: 'ゴール到達' },
        { key: 3, label: 'EN 切れ' },
        { key: 2, label: 'EN スポットで補給' },
        { key: 1, label: 'EN 補給アイテムを使用' },
        { key: 0, label: 'EN 補給アイテムを携行' },
      ],
    })
  })

  it('一覧は直近の上限件数に限り、手数は全件で数える', () => {
    const entries = Array.from(
      { length: MOVE_HISTORY_DISPLAY_LIMIT + 5 },
      (_, q) => ({ kind: 'move' as const, path: [{ q, r: 0 }] }),
    )

    const { moveCount, rows } = toMoveHistoryView(entries)

    expect(moveCount).toBe(MOVE_HISTORY_DISPLAY_LIMIT + 5)
    expect(rows).toHaveLength(MOVE_HISTORY_DISPLAY_LIMIT)
    expect(rows[0].label).toBe(
      `${MOVE_HISTORY_DISPLAY_LIMIT + 5}手目: (${MOVE_HISTORY_DISPLAY_LIMIT + 4}, 0) へ 1 マス`,
    )
  })
})
