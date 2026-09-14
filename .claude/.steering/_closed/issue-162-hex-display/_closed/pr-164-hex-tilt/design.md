# hex tilt 検証

issue: #162

## 目的

stage-07（hex グリッド試作）に perspective + rotateX の傾き表現を追加、tilt 検証を実施。

## 背景・制約

- pr-163-hex-display design.md 実装計画「検証手順: tilt=0 でまず hex 描画・隣接移動を確認 → 傾き（rotateX）を入れて列オフセット方向の歪みを目視確認」の後続対応
- stage-07 `index.tsx` は元々「遠近表現（stage-05/06 の perspective + rotateX）との組合せは対象外」としていた部分

## 実装計画

- [x] `usePerspectiveControl`（stage-05 から import）を stage-07 へ組込み、tilt スライダー追加
- [x] scene/floor を `display: inline-block` 化し、rotateX の軸・perspective の消失点を hex セル群の中心付近へ合わせる
- [x] Playwright headless で tilt=0/45deg・隣接クリック移動・console error なしを確認

## 決定事項

- 2026-09-14: tilt（rotateX 傾き）検証実施。`sceneStyle`/`floorStyle` にサイズ指定がないと rotateX の軸・perspective の消失点が画面全体基準になりセル群が大きくずれて見えたため、双方を `display: inline-block` 化しコンテンツ幅へフィットさせて解消
- 2026-09-14: 別途検討事項として、既存 box-bot（stage-05/06 actor）の設置・移動を hex 座標系へ適用する項目を追加（今回のスコープ外、次 PR 以降で対応）

## 懸念・リスク

- 既存 box-bot（actor）の hex 座標系への適用は別途検討（次 PR 以降）
- 遠近表現と hex 特有の歪みの組合せは tilt=0/45deg のみ確認。他角度・他 hexSize での検証は未実施
