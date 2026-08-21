# box-bot-samples

## 目的

`prototypes/box-bot`(手描き風ボックスロボット、2D SVG + 3D three.js)を `samples/figure/` 配下のサンプルとして整備する。

## 背景・制約

- 既存 `samples/figure/robot-01` のパターン(figure 配下に1コンポーネント)を踏襲。
- `prototypes/box-bot/box-bot-01`(2D)・`prototypes/box-bot/3d/box-bot-3d-01`(3D)を移設。移設先で他から未参照だったため import 修正は不要だった。
- 3D 側は react-three-fiber(`@react-three/fiber`/`@react-three/drei`)実装。Canvas は 1 枚のラスタとして描画されるため、DOM の border-radius/overflow によるクリップは中身(本体・影)を一律に切り取る制約がある。

## 実装計画

- [x] `prototypes/box-bot` を `samples/figure/box-bot/_components/{box-bot-2d,box-bot-3d}` へ移設(pure rename)
- [x] `BoxBot` wrapper 追加。`mode`(`'2d'` 既定 / `'3d'`)で切替
- [x] 3D 腕の初期表示アニメーションのずれを修正(JSX 初期 rotation と useFrame の目標値の不一致)
- [x] story 追加: サイズ変更(`Sizes`)・回転変更(`Static`/`SlowRotate`)・升目表示との組み合わせ(`Grid`/`Grid3D`)
- [x] `shadowScale` 追加。円形クリップ等で接地影が見切れる場合に縮小可能に
- [x] `Circle` story: 円形の背景 div + クリップしない一回り大きい Canvas を重ね、本体・影が円の外へはみ出せる構成に変更(border-radius+overflow:hidden 単体では本体ごと切れてしまうため)
- [x] `fov` 追加。Canvas 拡大時、拡大率に応じて画角を広げることで本体の見かけの大きさを保ったまま表示範囲だけ広げられるように
- [x] `Grid3D`: ジャンプ演出で頭部が Canvas 上端を超える問題に、Canvas 拡大 + fov 補正で対応(計算ベース、実機でのジャンプ再現検証はできていない)
- [x] `OverlapGrid3D` story 追加。three(WebGL) 実装同士を升目から微妙にずらして配置し、本体の 1/4 ほどが隣と重なる状態を確認できるように
- [x] JSDoc 整備。深い階層の親キー(`arm`/`body`/`eye`/`head`/`leg` 自体)への追加、「タイトル。詳細」の句点区切り一文をタイトル+箇条書きの構成へ分離
- [x] README に使用例を追記

## 決定事項

- Canvas(WebGL)は DOM 上ただの矩形として扱われ、透明ピクセルを判定してクリックを下の要素へ透過させる標準機構がない。複数体が重なる配置(`OverlapGrid3D`)では上の Canvas が常にクリックを奪うため、表示確認用途と割り切り `interactive={false}` で対応した。
- 円形表示は「円形背景 div(下) + クリップしない一回り大きい Canvas(上、transparent 背景)」の2層構成を採用。border-radius+overflow:hidden による直接クリップは不採用(本体まで一律に切れるため)。
- `OverlapGrid3D` の重なりオフセットは、セル index に比例した累積オフセット方式を採用。偶奇の千鳥配置は列/行が3つ以上になると誤差が累積するバグがあり不採用とした。

## 懸念・リスク

- `OverlapGrid3D` の重なり量(本体の1/4)は計算上の値であり、6体を敷き詰めた密集グリッドでは視覚的にはより強く重なって見える。実際の見え方は要確認。
- `Grid3D` のジャンプ見切れ対応は、カメラ距離・fov からの計算値(ジャンプ最大上昇 ≈13px @cellSize96)を基にした対応で、Playwright でのクリックシミュレーションによる実機検証はできていない。
- Canvas 重なり時のクリック透過は根本解決していない(three.js 側で raycast ベースの透過制御を自前実装すれば可能だが未着手)。actor 同士が重なる場面が実際に必要になった場合は要検討。
