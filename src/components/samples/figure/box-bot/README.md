# samples/figure/box-bot/

手描き風ボックスロボット

- `mode` prop で 2D(SVG) / 3D(three.js) 切替
  - `2d`(既定): `_components/box-bot-2d`
  - `3d`: `_components/box-bot-3d`
- 旧 `prototypes/box-bot` から移設

## 使用例

```tsx
import { BoxBot } from '@/components/samples/figure/box-bot'

<BoxBot mode="2d" style={{ height: 200 }} />
<BoxBot mode="3d" style={{ height: 320, width: 320 }} />
```

- サイズ変更: `style.height`/`style.width`(2D/3D 共通)
- 升目(grid)表示と組み合わせる例: `index.stories.tsx` の `Grid`(2D)/`Grid3D`(3D)

### 3D 固有 props

- `autoRotate`/`rotateSpeed`: 自動回転の有無・速度
- `rotationY`: 初期 y 軸回転(ラジアン)。`autoRotate` はこの値を起点に加算回転する(例: `Math.PI` で背面向き)
- `orbit`: マウスドラッグでの回転操作(OrbitControls)の有効/無効
- `fov`: カメラ視野角。Canvas をセルより大きく確保しつつ本体の見かけの大きさを保ちたい場合に、拡大率に応じて広げる(`Grid3D`/`Circle` story 参照)
- `shadowVariant`: 接地影の方式。`contact`(既定、`_components/contact-shadow`): 俯瞰ブラー式の疑似影(drei ContactShadows)、光源とは無関係。`cast`(`_components/cast-shadow`): 平行光源によるシャドウマッピング、`lightPosition` で向き・長さを制御できる。対称に広がる `contact` は影を伸ばす演出には不向き(遠い側が本体に隠れる)、遠くまで伸ばしたい場合は `cast` を使う
- `lightPosition`: 平行光源の位置。`shadowVariant="cast"` 時、影の向き・長さを決める。低い角度にする程、影が長く伸びる
- `shadowOpacity`: 接地影の不透明度
- `groundPosition`: 接地面(影の受け皿)自体の位置。高さ・水平オフセットを調整する

### その他の表示バリエーション

- 円形クリップ表示: `Circle` story。border-radius+overflow:hidden だけでは本体・影ごと切り取られるため、円形背景 div + クリップしない一回り大きい Canvas を重ねる構成にしている
- 複数体の重なり表示: `OverlapGrid3D` story。Canvas(WebGL)は透明部分でもクリックを奪うため、重なる配置では `interactive={false}` を推奨

## 検討事項

- 被ダメージモーション(仮称、要 naming): `fall`(転倒)とは別の reaction として検討していたが、いったん延期。命名・挙動とも未定。`.claude/.steering/20260820-action-reaction-design/design.md` 参照
