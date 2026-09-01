# box-bot-01/

手描き風ボックスロボットの 3D figure。表示領域を設置領域に一致させ (#108)、ゲーム内で actor のレンダリング要素として使うことを想定する。

## 構成

```text
index.tsx           設置領域 (Assembly) + 表示領域ラッパー div + Canvas。影・ライト・OrbitControls の配線
index.types.ts      BoxBot3DProps / Vec3
index.stories.tsx   Jump / Fall (facing グリッド 9 体) / Spin の story
_components/
  assembly/         設置領域。正方形・配下はすべて % 指定 (@/components/ad 系のローカルコピー)
  box-bot-model/    Canvas 内の bot 本体
    index.tsx           JSX。yawRef > rootRef > fallPivotRef の pivot chain と各部位の SketchBox
    index.hooks.ts      adapter。module scope の write* が THREE.Group / DOM へ書き込む
    index.types.ts      BoxBotModelProps / BoxBotRefs / BoxBotLayout
    index.constants.ts  DEFAULTS (ジオメトリ・見た目)
    index.contexts.tsx  ref 群 / EventTarget / アクション一覧の Context
    use-box-bot-action-dispatcher.ts  BOX_BOT_ACTIONS からイベント発火メソッドを導出
    _lib/derive-layout.ts   cfg → 部位アンカー (layout.head.y 等) の純関数
    _components/         ink (縁取り) / sketch-box (手ブレ箱)
    _hooks/             use-click-bindings (要素クリック → action イベント)
  cast-shadow/      投影影
  contact-shadow/   接地影 (body 形状 + facing 連動の楕円、fall 時に体へ寄せる)
_actions/           アクションレジストリ
  define-action.ts  descriptor factory。defaults と actionConfig 上書きをマージして host.config にする
  types.ts          BoxBotAction / BoxBotActionHost (apply* 意図動詞)
  index.ts          BOX_BOT_ACTIONS 配列 (= useFrame 実行順) + DEFAULT_CLICK_BINDINGS
  jump/ spin/ fall/  各 descriptor (config.ts 定数 / use-*.ts 購読・可視化 / index.ts)
_lib/               approach (指数減衰) / box-edges / jitter-edge / make-rng
```

## アクション

- bot 本体は要素押下で `ON_CLICK_ELEMENT` を発行するだけ。どの要素でどの action を起こすかは `_actions/index.ts` の `DEFAULT_CLICK_BINDINGS` (と `clickBindings` prop の上書き) が決める。
- 各 action は bot 内部構造 (THREE.Group / 表示領域 DOM) を直接触らず、host の `apply*` 意図動詞経由で操作する。adapter (`box-bot-model/index.hooks.ts`) が module scope の `write*` で THREE / DOM へ反映する。
- 追加は `_actions/<name>/` に descriptor を作り `BOX_BOT_ACTIONS` へ 1 行。dispatcher のメソッド・型はこの配列から導出される。

### 表示領域シフト (#108)

- `displayAreaRef` = Canvas ラッパー div。`applyShift({ x, y })` が `left` / `top` を `calc(50% ± …)` で書き換え、設置領域に対して表示領域をずらす。
- jump = 縦移動 (`{ x: 0, y: lift }`)。fall = 姿勢回転 (Canvas 内) + 倒れ込み方向へのシフト (facing をカメラ投影して算出)。

### 実装済み

jump / spin / fall (get-up は fall 内の逆補間)。

### 未実装 (samples 側にあり、レジストリ形式で復帰予定)

auto-rotate / arm-toggle / walking / marching / body-bobbing / hopping。walking・marching は脚 ref、body-bobbing は `walkingBobRef`、hopping は待機状態 ref の追加を伴う。詳細は design.md の「未実装 action」参照。
