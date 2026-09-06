# ui-three/

three.js(r3f)使用コンポーネント置き場。`../ui/CLAUDE.md` の UI 要素方針(挙動非接続・最初から表示)に従う。

## 方針

- Canvas 内 3D 空間へ直接配置する要素(装飾メッシュ等)。`BoxBot` の `children` 経由で接続する
- 画面座標ベースの `action-circle`/`action-square` 等(`../ui/` 配下)とは別枠。3D 空間内の world 座標で配置するもののみ対象

## バリエーション一覧

- `ground-ring`: bot 足元を囲む平面リングメッシュ、装飾用途(実装済・単独 story あり)

各バリエーションの `index.stories.tsx` は `../_story-decorators` の `withBotChildren` decorator 経由で利用(`BoxBot` の `children` として配置)。
