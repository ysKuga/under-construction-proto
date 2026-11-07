# 実装計画（選択肢パネルへ選択肢を event で登録する仕組み）

- [ ] パネルの自動表示・ピン留めを直す
- [ ] `_stores/choices`・`Expedition-choice-select`・登録の hook を定義する（配線のみ）
  - (decision-records.md 2026-11-07 設計)
- [ ] 経路の選択肢（実行・中継点・キャンセル）を `_choices/route` へ移し、パネルを store の購読・選択の発行へ切り替える
- [ ] 選択肢の追加で変えてよいファイルの範囲を `.claude/rules/` へまとめる
