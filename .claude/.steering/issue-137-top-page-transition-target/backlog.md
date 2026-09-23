# 実装計画（issue #137）

- [ ] 中継点経由の経路統合と自動移動 → [#226](_issues/issue-226-waypoint-auto-move/backlog.md) へ分離
- [ ] ステージ上で動作する bot とは別に bot を独立表示し、「現在どちらを向いているか」を同期して表示する実装を検討
- [ ] find-path は現状固定ステージだが、ランダム生成を検討中
- [ ] マスホバー/選択時の内包要素一覧表示を検討
  - (design.md 懸念・リスク)
- [ ] アイテム・スポット等のマーカーが tilt の影響を受けないよう修正する
  - 現状: floor の `rotateX` と一緒に寝てしまう
  - 参考: bot は `ActorsLayer` で `rotateX(calc(-1 * var(--floor-tilt)))` により tilt を打ち消して直立させている
- [ ] 移動時間が長いと、マスを移動するごとに隣接マスへのターゲット表示（`MoveTargetLayer`）が出る問題を解消する
  - 移動時間: `Stage07` の「移動時間(ms)」スライダー
