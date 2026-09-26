# 実装計画（proto-03 のステージ上の bot と独立 bot を歩行中に上下させる）

- [x] `bodyBobbingAction` を box-bot から export する
- [x] ステージ上の bot（`Stage07` の `ActorsLayer`）の `actions` へ `bodyBobbingAction` を追加する
  - `bodyBobbing.swingRef` を脚振り角 `legSwingAngle` に揃える
- [x] 独立 bot の `actions` へ `bodyBobbingAction` を追加する（中継対象には含めない）
- [ ] Storybook で上下の見え方を確認する（目視、ユーザー側）
  - 視認しにくければ `height` の調整、または Stage07 へのスライダー追加を検討する
