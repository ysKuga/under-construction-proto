# 実装計画（expedition のレスポンシブ対応）

- [ ] 選択肢パネルを新設し、実行・中継点・キャンセルを移す
  1. 表示部品 `_components/choice-panel` と story
  2. 実行・中継点・キャンセルの配線（既存の event・store へ繋ぐのみ）
  3. 中継点・実行の吹き出しを外す（目標セル上の組も）
  - (decision-records.md 2026-10-23 選択肢パネル / 選択肢パネルの event 設計)
  - [_pr/pr-407-expedition-choice-panel/design.md](_pr/pr-407-expedition-choice-panel/design.md)
- [ ] EN スポットの使用・EN 切れの救助を選択肢パネルへ移す
  1. `Expedition-shake-bot-bubble` を `Expedition-action-rejected` へ改名し、パネルが購読する
  2. EN スポット・救助の吹き出しを外す
  3. 補給中・補給完了のみ残る `bot-bubbles` の名前を見直す
  - (decision-records.md 2026-10-23 選択肢パネル / 選択肢パネルの event 設計)
- [ ] マスの情報・手数の履歴の padding を `md` 未満で 4px にする
  - (decision-records.md 2026-10-23 選択肢パネル)
- [ ] 状態表示・マスの情報・手数の履歴の表示・非表示を切り替える
  - 着手前に `event-binding-design` で設計する
  - (decision-records.md 2026-10-19 表示・非表示)
- [ ] 傾けた床での表示範囲の移動を検討する
  - (../issue-357-expedition/decision-records.md 2026-10-18 レスポンシブ)
  - (decision-records.md 2026-10-19 実行順序)
- [ ] 盤面全体の表示への切替を検討する
  - アイテム等
  - 後回し・別 issue も可
  - (decision-records.md 2026-10-19 実行順序)
