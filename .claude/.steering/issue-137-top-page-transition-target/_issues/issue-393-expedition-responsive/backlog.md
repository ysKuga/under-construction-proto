# 実装計画（expedition のレスポンシブ対応）

- [ ] 表示領域で盤面の画面からのはみ出し・傾きによる余白をなくす
  - 固定サイズの表示領域 + bot 中心のカメラ追従
  - (decision-records.md 2026-10-19 表示領域)
  - [_pr/pr-400-expedition-stage-viewport/design.md](_pr/pr-400-expedition-stage-viewport/design.md)
- [ ] 状態表示・マスの情報・手数の履歴の表示・非表示を切り替える
  - 着手前に `event-binding-design` で設計する
  - (decision-records.md 2026-10-19 表示・非表示)
- [ ] 傾けた床での表示範囲の移動を検討する
  - (../issue-357-expedition/decision-records.md 2026-10-18 レスポンシブ)
  - (decision-records.md 2026-10-19 実行順序)
- [ ] スマホの幅での bot の状態表示を検討する
  - かなり小さくする
  - 表現方法（非表示・ポップオーバー・ドロワー等）
  - (decision-records.md 2026-10-19 実行順序)
- [ ] 盤面全体の表示への切替を検討する
  - アイテム等
  - 後回し・別 issue も可
  - (decision-records.md 2026-10-19 実行順序)
