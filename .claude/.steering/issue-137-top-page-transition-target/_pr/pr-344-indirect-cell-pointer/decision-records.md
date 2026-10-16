# 決定事項（目標設定になるマスの pointer を挙動に揃える）

## 2026-10-16

- pointer は現在マス以外の全マスへ付ける。障害物も含める（クリックで到達不能の通知が出るため）
- セルクリックの判定の分散（props drilling・`useHexMove` と `useHandleIndirectClick` への分散）は本 PR では扱わない
  - 対応方針: event 経由で find-path 側の listener へ集約する（context 化は採らない）
  - 本 PR のマージ後に着手する（[親 backlog](../../backlog.md)「セルクリックの判定を event 経由で find-path 側の listener へ集約する」）
