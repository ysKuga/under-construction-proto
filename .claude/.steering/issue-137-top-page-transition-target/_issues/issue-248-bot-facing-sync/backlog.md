# 実装計画（ステージ上の bot の状態を同期する独立 bot 表示）

- [ ] 独立 bot へステージ上の bot の各種状態を同期する
  - 歩行（action イベントの許可リスト中継。[decision-records.md](decision-records.md) 2026-09-26）
    - [ ] `actorEventTarget` を `Stage` 内から持ち上げ、`StandaloneBot` からも参照できるようにする
    - [ ] 独立 bot 側に `walking`/`walkingReset` の中継 hook を追加し、`StandaloneBot` の `actions` へ同 action を渡す
    - 上記 2 項目: PR #256
    - [ ] 脚振り周期のずれへの対応を検討する（中継実装後、実際の見た目を確認してから）
  - EN 切れ
- [ ] 向きの同期を行うか検討する
  - 行わない可能性あり（別途 UI を用意する等）
