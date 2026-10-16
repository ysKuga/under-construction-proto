# 決定事項（通れない隣接マスのクリックを目標設定にする）

## 2026-10-16

- #341 がマージ済みのため、ブランチ・PR base とも main にする（当初予定は 137-current-cell-click ベース）
- 通れない隣接マスは、障害物・一方通行・EN 切れ全てを目標扱いにする（前段の決定、[#341](../../_closed/pr-341-current-cell-click/decision-records.md)）
- prop 名は `onIndirectClick`（直接移動できないクリック）
- proto-03 ハンドラ側の迂回経路テストは追加しない
  - 理由: BFS は既存のまま変更なし。新しい挙動は `useHexMove` 側のテストで担保し、迂回経路は Storybook で確認
