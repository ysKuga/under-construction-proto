# 決定事項（ステージ上の bot の状態を同期する独立 bot 表示）

- 2026-09-25: 親 #137 backlog の「bot 独立表示・向き同期」項目を GitHub サブ issue #248 として分離
- 2026-09-25: 独立 bot の配置先は proto-03 のステージ横とする（PR #249）
- 2026-09-25: 同期対象を「向き」から「各種状態（歩行・EN 切れ等）」へ変更。向きの同期は行わない可能性あり（別途 UI を用意する等）
- 2026-09-26: 歩行の同期経路は「action イベントの許可リスト中継」とする
  - `actorEventTarget` を `StageArea` へ持ち上げる
  - 独立 bot 側で `ACTION_WALKING`/`ACTION_WALKING_RESET` を listen し、自身の `eventTarget` へ再送する
  - 採用理由
    - 歩行の判定結果（`enableWalking` 判定・トグル状態・reset 時間）をそのまま受けられ、`Stage07` のロジックを重複させない
    - `face` を許可リストから外すことで、向きを同期しない選択ができる
    - EN 切れも `ACTION_ENERGY_OUT` の追加で停止待ち（`useEnergyOutAfterStop`）込みで同期できる
  - 不採用
    - `eventTarget` の単純共有: `face` も強制的に同期され、同期対象を選べない
    - `Stage07-move-*` 購読で独立 bot 側に歩行を再現: `Stage07` の歩行ロジックを二重に持つ
