# 実装計画（ゲームフェーズの導入）

- [ ] game-phase store を作成する
  - フェーズ: `playing` / `clearing` / `cleared`
  - 遷移: ゴール進入で `clearing`、ゴール中心到着で `cleared`
- [ ] フェーズごとの許可の表と購読 hook を作成する
- [ ] 操作・演出の可否を表の参照へ置き換える
  - 進入ガード・`interactive`・EN 切れ演出・吹き出し・EN 不足の警告
- [ ] 表示・ゴールの演出をフェーズの参照へ置き換える
- [ ] goal store を削除する
