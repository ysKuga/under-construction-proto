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
- `orbit`: マウスドラッグでの回転操作(OrbitControls)の有効/無効
- `fov`: カメラ視野角。Canvas をセルより大きく確保しつつ本体の見かけの大きさを保ちたい場合に、拡大率に応じて広げる(`Grid3D`/`Circle` story 参照)
- `shadowScale`: 接地影(ContactShadows)の広がり。円形クリップ等で影が見切れる場合に縮小する

### その他の表示バリエーション

- 円形クリップ表示: `Circle` story。border-radius+overflow:hidden だけでは本体・影ごと切り取られるため、円形背景 div + クリップしない一回り大きい Canvas を重ねる構成にしている
- 複数体の重なり表示: `OverlapGrid3D` story。Canvas(WebGL)は透明部分でもクリックを奪うため、重なる配置では `interactive={false}` を推奨
