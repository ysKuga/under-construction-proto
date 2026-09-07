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

## 未対応 / 段階 2 以降

- actor 未搭載。box-bot を載せる際、床と同じ 3D 空間に乗るため逆 `rotateX` で立て直す必要がある（`ui-three` の occlude 課題と同種）。
- セルのクリック企図（stage-04 の `MoveIntent`）は未接続。actor 搭載時に戻す。
- `perspectivePx` / `perspectiveOrigin` は props 固定。pan / zoom（カメラ相当）の ref 制御は未着手。
