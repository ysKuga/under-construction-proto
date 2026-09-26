# 実装計画（issue #137）

- [ ] ステージ上の bot の状態を同期する独立 bot 表示 → [#248](_issues/issue-248-bot-facing-sync/backlog.md) へ分離
- [ ] find-path は現状固定ステージだが、ランダム生成を検討中
- [ ] マスホバー/選択時の内包要素一覧表示を検討
  - (design.md 懸念・リスク)
- [ ] アイテム・スポット等のマーカーが tilt の影響を受けないよう修正する
  - 現状: floor の `rotateX` と一緒に寝てしまう
  - 参考: bot は `ActorsLayer` で `rotateX(calc(-1 * var(--floor-tilt)))` により tilt を打ち消して直立させている
- [ ] 目標を設定した際に、bot と同様の bubble を目標側にも表示することを検討する
  - 目標が遠距離にあると、bot の bubble を操作するためにカーソルを bot まで戻す必要があるため
- [x] proto-03 の値調整 UI に EN 無限モードを追加する（[#258](_closed/pr-258-en-infinite-mode/backlog.md)）
  - 手段: 移動時の EN 消費量スライダーを追加し、0 で無限とする
    - 消費は `use-handle-cell-change.ts` の `Energy-consume`（`amount: 1` 固定）の 1 箇所のみ
    - EN store・proto-01 と共通の `EnergyDebugPanel` は変更しない
  - EN 0 の状態で有効化した場合は 0 のまま（回復させない）
- [ ] 中継点選択をキャンセルした後も、設置した中継点が保持されたままになっている
  - キャンセル時は、目標をクリックした直後の経路（中継点なし）へ戻すのが望ましい
