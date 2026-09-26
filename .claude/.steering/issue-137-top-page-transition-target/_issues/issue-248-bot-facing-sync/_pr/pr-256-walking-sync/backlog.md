# 実装計画（proto-03 の独立 bot へステージ上の bot の歩行を同期する）

- [x] `actorEventTarget` を `Stage` 内から `_contexts/` の Provider へ持ち上げる
  - `Stage` と `StandaloneBot` の双方から参照するため
  - EN 切れ演出の登録は `Stage` 側に残す
- [x] 独立 bot 側に walking / walkingReset の中継 hook を追加する
- [x] `StandaloneBot` へ自前の `eventTarget` と walking / walkingReset action を渡す
- [ ] Storybook で歩行の同期と、脚振り周期のずれの有無を確認する（目視、ユーザー側）
  - Playwright で中継の成立（walking / walkingReset が独立 bot の EventTarget へ届く）は確認済み
  - headless では WebGL 描画の変化を取得できず、見た目は未確認
