# 実装計画（issue #137）

- [ ] ステージ上の bot の状態を同期する独立 bot 表示 → [#248](_issues/issue-248-bot-facing-sync/backlog.md) へ分離
- [ ] find-path は現状固定ステージだが、ランダム生成を検討中
- [ ] マスホバー/選択時の内包要素一覧表示を検討
  - (design.md 懸念・リスク)
- [ ] アイテム・スポット等のマーカーが tilt の影響を受けないよう修正する
  - 現状: floor の `rotateX` と一緒に寝てしまう
  - 参考: bot は `ActorsLayer` で `rotateX(calc(-1 * var(--floor-tilt)))` により tilt を打ち消して直立させている
- [ ] proto-03 の構造見直し → [pr-250-proto03-structure](_pr/pr-250-proto03-structure/backlog.md)
  - `_components/`: 部品のみ格納する
    - 現状は `*-layer` `*-bubble` 等が混在している
  - `_layers/` 新設を検討する
    - `_components/` 配下の `*-layer` の移動先候補
  - `_contents/` 新設を検討する
    - `FindPathProto03Content` 内で実装しているページのコンテンツを個別に格納する
    - `FindPathProto03Content` は組み合わせるのみとし、肥大化を解消する
  - 整理した内容を pages の CLAUDE.md へ pages 全体の方針として記載し、今後の開発方針とする
    - 依存関係(`_contents` → `_layers` → `_components` 等の参照方向)を含める
    - 記載先: `src/components/pages/CLAUDE.md`(現状未作成)
