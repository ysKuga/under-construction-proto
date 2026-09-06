# ui-three/

three.js(r3f)使用コンポーネント置き場。`../ui/CLAUDE.md` の UI 要素方針(挙動非接続・最初から表示)に従う。

## 方針

- Canvas 内 3D 空間へ配置する要素(装飾メッシュ等)。world 座標で配置する
- 画面座標ベースの `circle`/`square` 等(`../ui/` 配下)とは別枠
- bot との接続方式は 2 通り。バリエーションごとに選ぶ
  - **children 共有**: `BoxBot` の `children` へ渡す。bot と同じ Canvas・カメラを共有 → カメラ操作で bot と一体に動く
  - **独立 Canvas**: 専用 `<Canvas>` を透過オーバーレイ。カメラを `BoxBot3D` に合わせる → bot の回転・カメラ操作と無関係に固定

## バリエーション一覧

- `ground-ring`: bot 足元を囲む平面リングメッシュ。独立 Canvas、bot 回転・カメラ操作で動かない(実装済・単独 story あり)
- `tilt-ring`: `ground-ring` の傾き可変版。children 共有、カメラ操作で bot と一体に動く。水平からの傾き・向きを props で調整(実装済・単独 story あり)

story の decorator:

- children 共有型 → `../_story-decorators` の `withBotChildren`
- 独立 Canvas 型 → `withBotLayered`
