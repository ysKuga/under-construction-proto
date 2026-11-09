# 決定事項（揺れの event の改名と選択肢パネルの揺れ）

- 2026-11-07: steering を作成した
- 2026-11-07（揺れ）: `Expedition-action-rejected` へ改名し、選択肢パネルを揺らすようにした
  - 手段: `ChoicePanelHandle.shake`。Web Animations API で `translate` を動かす（`BotBubble` と同じ動き）
  - 盤面のクリックの拒否: パネル（`popover="auto"`）は外側のクリックで閉じるため、揺れは見えない
    - パネル内の選択肢の拒否（救助・EN スポット、後続 PR）では見える
