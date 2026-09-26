# 実装計画（issue #137）

- [ ] ステージ上の bot の状態を同期する独立 bot 表示 → [#248](_issues/issue-248-bot-facing-sync/backlog.md) へ分離
- [ ] find-path は現状固定ステージだが、ランダム生成を検討中
- [ ] マスホバー/選択時の内包要素一覧表示を検討
  - (design.md 懸念・リスク)
- [ ] アイテム・スポット等のマーカーが tilt の影響を受けないよう修正する
  - 現状: floor の `rotateX` と一緒に寝てしまう
  - 参考: bot は `ActorsLayer` で `rotateX(calc(-1 * var(--floor-tilt)))` により tilt を打ち消して直立させている
