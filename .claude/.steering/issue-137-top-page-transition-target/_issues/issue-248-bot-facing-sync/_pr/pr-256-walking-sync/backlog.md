# 実装計画（proto-03 の独立 bot へステージ上の bot の歩行を同期する）

- [ ] `actorEventTarget` を `Stage` 内から `_contexts/` の Provider へ持ち上げる
  - `Stage` と `StandaloneBot` の双方から参照するため
  - EN 切れ演出の登録は `Stage` 側に残す
- [ ] 独立 bot 側に walking / walkingReset の中継 hook を追加する
- [ ] `StandaloneBot` へ自前の `eventTarget` と walking / walkingReset action を渡す
- [ ] Storybook で歩行の同期と、脚振り周期のずれの有無を確認する
