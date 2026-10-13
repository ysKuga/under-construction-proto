# 実装計画（ゴール到達時に bot の両手を上げる）

- [x] `flagRaised` で `armToggle` を 1 回発火する
- [x] 到達後は `energyOut` の発火を止める
- [x] 状態表示 bot へ `armToggle` を中継する
- [x] リセットで腕が戻るか確認する
  - Provider 再マウントで戻る（追加実装なし）
