# 実装計画（選択肢パネルの新設）

- [ ] 設定ポップオーバーの Esc を `useKeyLayer` へ揃える fix PR を先に出し、本 PR のベースにする
  - (decision-records.md 2026-10-25 Esc)
- [ ] `resolveVisibility` がパネルの選択肢の形に合うか確認する
- [ ] 表示部品 `_components/choice-panel` と story を作る
  - (decision-records.md 2026-10-25 レイアウト)
- [ ] 実行・中継点・キャンセルを既存の event・store へ繋ぐ
- [ ] 中継点・実行の吹き出しを外す（目標セル上の組も）
