# 実装計画（proto-03 のステージ上の bot と独立 bot を歩行中に上下させる）

- [x] `bodyBobbingAction` を box-bot から export する
- [x] ステージ上の bot（`Stage07` の `ActorsLayer`）の `actions` へ `bodyBobbingAction` を追加する
  - `bodyBobbing.swingRef` を脚振り角 `legSwingAngle` に揃える
- [x] 独立 bot の `actions` へ `bodyBobbingAction` を追加する（中継対象には含めない）
- [x] Stage07 へ体の上下量(`bodyBobHeight`)のスライダーを追加する
  - 既定 `height`(0.025)ではステージ上の bot(56px)の上下が視認できなかったため
- [x] Storybook で上下の見え方を確認する（目視、ユーザー側）
  - 上下量の既定を 1 とする
