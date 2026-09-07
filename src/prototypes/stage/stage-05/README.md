# Stage05

CSS `perspective` + `rotateX` で床面を台形にした遠近ステージ。stage-04 の scale 補間案は不採用。

## 遠近モデル

- 外枠に `perspective` / `perspectiveOrigin` を置き、内側の等間隔グリッド (`display: grid`) を `rotateX` で寝かせる。
- 遠近はブラウザの透視変換に一任。行ごとの座標計算は不要。
- セルは実際に奥へ変形する（scale 補間案のように矩形のまま縮小するのではない）。

## 傾きの ref 制御

- 傾き (`rotateX` の角度) は `_hooks/use-perspective-control.ts` の `usePerspectiveControl` が管理。
- `floorRef` 経由で床要素の `--floor-tilt` カスタムプロパティを直接書換える。React state を持たない。
- スライダー操作で `cols * rows` のセル群は再レンダリングされない（`console.log('render: Stage05')` で確認可）。
- 値は 0〜85deg にクランプ。90 近傍は床が消えるため。
- `transition: transform 150ms` で傾き変更を補間。

## actor (box-bot-01)

段階 2 で `_components/actors-layer` として `@/components/theater/figure/box-bot` の `BoxBot01`（ゲーム内 actor 用）を搭載。samples 版はデモ用見本のため使わない。

- floor（grid）に `transform-style: preserve-3d` を付け、`BoxBot01` を floor の子として絶対配置する。
- box-bot-01 は設置領域（= `style.height` = `cellSize`）を占有枠とし、表示領域（Canvas）は設置領域 * `DISPLAY_RATIO`（1.18）。bot は設置領域からわずかにはみ出す。bot は Canvas 中央へ較正済み。samples 版のような 2 倍 Canvas・中心ずれ・大幅な透明部クリック奪取が起きないため、`FOOTPRINT_RATIO` / `canvasCenterOffset` の実測補正と設置領域ラッパー div は不要。
- 床の `rotateX` を打ち消す逆回転 `rotateX(calc(-1 * var(--floor-tilt)))` を掛け、傾いた床の上で直立させる。`--floor-tilt` は CSS 変数継承で floor から降ってくるため、傾きスライダー操作で actor も React 再レンダリングなしで追従する。
- `orbit={false}` / `actions={[]}`（jump / spin を無効化）。`translate(-50%, -53%)`（実測）で足元をセル中央付近へ寄せる。
- position 管理と移動企図配線は stage-04 の資産を再利用（`src/prototypes/CLAUDE.md` の「若い番号から import 可」）。
  - `stage-04/_contexts/actor-position-context`（`ActorPositionProvider` / `useActorControl` / `useActorPosition`）と `stage-04/_hooks/use-keyboard-move` を import。座標計算を含まないためコピー不要。
  - 座標系が異なる layer（`geo-layer` / `actors-layer`）は grid + % 前提で新規作成。
- 配線 3 系統: セルクリック（cell-click）/ actor クリックで次セルへ順送り（actor-click、`onClick`）/ 矢印キー・WASD（keyboard）。

## 未対応 / 段階 2 以降

- 複数 actor / 障害物の前後関係（z 順）。box-bot-01 の Canvas は `cellSize` に収まるため単体では occlude 問題は出にくいが、複数体を重ねる場合は透明部のクリック奪取・描画順の対処が要る。
- 遠近に伴うセルのクリック判定の歪み。奥のセルほど当たり判定が小さくなる。
- **tilt 依存の actor 位置ズレ**。`translate(-50%, -53%)` が固定値のため、tilt が大きいほど box-bot がマス中心から外れる。tilt max（85deg）ではマスの左上へ大きく外れる。tilt が小さい〜中程度では許容範囲。逆 `rotateX` の弧が tilt に比例して伸び、billboard の足元アンカーが本来のセル位置から乖離するのが原因。`--floor-tilt` を使った `calc` での translate 補正が必要（再レンダリング回避方針を保つため JS state 化は避ける）。
- 奥行きセルでの actor 設置位置の微妙なズレ（`translate` の Y は中間セル基準で調整済み、最奥行は浮き気味）。
- `perspectivePx` / `perspectiveOrigin` は props 固定。pan / zoom（カメラ相当）の ref 制御は未着手。
