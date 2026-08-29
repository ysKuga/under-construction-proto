# box-bot アクション範囲 (表示領域) の限定

## 目的

box-bot 3D のアクション (特に fall 完全転倒) が canvas 矩形を逸脱して見切れる問題を、
canvas を設置領域と一致させたまま解消する。試作は `src/prototypes/box-bot/box-bot-01/` で行う。

GitHub #108 / Jira UC-10「box bot 改善」内「アクション範囲 (表示領域) の限定」に対応。
コピー設置は #107 に切り出し済み。

## 背景・制約

### 用語

- 設置領域: 他要素との組み合わせのための領域。`Assembly` (`ui-container` + `ui-assembly`) の正方形。
- 表示領域: アクションのために設置領域を逸脱させた領域。現状の `Canvas`。

### 現状の構造 (samples/figure/box-bot/_components/box-bot-3d)

- `Assembly` 内に `Canvas` を `position: absolute` で配置。
- Canvas サイズ `heightPx = assemblySize / BODY_HEIGHT_RATIO` (`BODY_HEIGHT_RATIO ≒ 233/480 ≒ 0.485`)。
  → Canvas が設置領域の約 2 倍。`transform: translate(-50%, calc(-50% + offset))` で中央 + 下方向オフセット。
- fall/jump の可動域を Canvas はみ出しで確保している。
- 破綻の兆候:
  - 404 ページで「BoxBot の表示領域を広くしているため」404 リンクに `z-10` 手当て。
  - `OrbitControls` の target を `-0.6` 上へずらして fall 時の見切れを回避。
  - `orbit={false}` 時に `onCreated` で明示 lookAt が必要 (Grid3D story の経緯)。

### 現状の fall 実装 (use-fall-action.ts)

- `fallPivotRef` = 接地点 (脚下端 `groundY`) へ pivot 移動したグループ。ここに `rotation.x = FALL_ANGLE` (≒90°)。
- 接地点を軸に前傾するため、頭が前方かつ下方へ張り出す。この張り出し分を Canvas はみ出しで確保していた。
- `useFrame` 内で `fallRef` 進行度 `p` に応じて `fallPivotRef.current.rotation.x` を補間。完了時 `postureRef = 1`。
- get-up (`use-get-up-action.ts`) は別 action。逆再生に相当。

### 前提の確認結果 (2026-08-27 ユーザー確認)

- fall 完全転倒 (90° → 横倒しで静止 → get-up) の表現は **必須**。→ 手足限定案は不可。
- 拡大縮小 (`style.height` での可変サイズ) は **禁止して固定サイズでよい**。→ `BODY_HEIGHT_RATIO` 逆算・可変ロジックを撤去可能。
- 複数 canvas 構成: box-bot の story にはあるが、現状は単独 canvas。単独 canvas 前提は後々検討。
  → 原則 (設置領域逸脱の禁止) は先取りするが、設置領域 ref の Canvas 外配線は最小実装に留める。

## 実装計画

### フェーズ 0: コピー設置 (#107、完了)

- [x] `samples/figure/box-bot` の 3D 実装を `src/prototypes/box-bot/box-bot-01/` へコピー。
- [x] `@/components/ad/molecules/assembly` をローカルコピー (`_components/box-bot-3d/_components/assembly/`)。
- [x] `@/hooks/event` / `@/utils/*` は import 維持。
- [x] entry (`index.tsx`) / stories は 3D のみ。2D SVG・samples 固有の調査 story は除外。
- [x] グループ README (`src/prototypes/box-bot/README.md`)。

### フェーズ 1: 案2 の試作 (別 issue、未着手)

方針: **表示領域の中心で回転 + 設置領域との相対位置アニメ**。

- [ ] Canvas 固定サイズ化。`BODY_HEIGHT_RATIO` 逆算・`style.height` 可変・`VERTICAL_OFFSET_RATIO` を撤去し、
      Canvas = 設置領域と一致 (+ 影・hopping ジャンプ高ぶんの余白のみ)。固定サイズは実測で決める。
- [ ] fall の回転 pivot を接地点 → 表示領域中心 (体の中心付近) へ変更。
      `fallPivotRef` の position を `groundY` → `0` 相当に。`use-fall-action` の pivot 前提コメントを更新。
- [ ] 接地点の辻褄合わせを設置領域オフセットで表現。
      `Assembly` の `ui-container` を ref で移動し、横倒し時に足元基準位置が前方・下方へズレた見た目を作る。
      `use-fall-action` の `useFrame` 内で `fallRef` 進行度 `p` に応じ、`fallPivotRef.rotation.x` と
      container ref の transform を同時補間。レンダリング抑制のため container も ref 直操作 (`useState` 不可)。
- [ ] 設置領域 ref を Canvas 外へ供給する配線。
      `BoxBot3D` で `containerRef` を作り、Canvas 内へ prop / context で渡して `use-fall-action` が読む。
- [ ] get-up の逆補間 (回転 + container オフセットの復帰)。
- [ ] 404 ページの `z-10` 手当て・`OrbitControls` target ずらしが不要になることを確認。

### 詰めるパラメータ (実測要)

- 固定 Canvas サイズ: `body.h + head.h + leg.h` + 影 + hopping ジャンプ高。現状 480px からどこまで縮むか。
- container オフセット量: 横倒し時の足元ズレ量 (前方 / 下方の px または比率)。
- 影の追従: cast/contact shadow は接地面固定。体心回転で体が浮く間、影は Canvas 内で足元追従か、設置領域基準で別処理か。

## box-bot アクションレジストリの後続作業 (PR #111 派生)

PR #111 で jump をレジストリ形式へ移行 (`_actions/<name>/` descriptor + `BOX_BOT_ACTIONS` 配列 +
`for..of` orchestrator + Context 注入)。fall/spin 等は検証のため一旦全削除、新形式で復帰予定。
経緯は PR #111 [design.md](_closed/pr-111-jump-display-area/design.md) の「実装済み: 案A」参照。
移行後に残った box-bot ↔ アクション間の結合が以下。実装は box-bot-01 で直接、別 PR 想定。

### 残る結合 (優先度順)

- **A. config が bot の型に穴を開けている (★最優先)**
  - `BoxBot3DConfig.jump: JumpConfig` / `DEFAULTS.jump = JUMP_DEFAULTS` — bot の config 型・既定値に
    jump 専用フィールド。jump を消すと宙に浮く。config を持つアクション追加 = bot の型を編集
  - 方向: descriptor に `defaults` を持たせ bot が動的マージ。`BoxBot3DConfig` から
    per-action フィールドを消す。詳細は下記「A の実装方針」
- **B. `BoxBotActionContext` が service locator (広い)**
  - アクションは `{ cfg, refs, displayAreaRef, props, eventTarget }` を丸ごと受け必要分を取る。
    jump は `refs.rootRef` (THREE.Group と知っている) / `displayAreaRef.style.top` (DOM と知っている) へ到達
  - 方向: アクションごとに narrow な host interface (port) + adapter。
    `useJump(host: JumpHost)` が `host.applySquash` / `host.applyLift` / `host.onFrame` だけ知る形
    (別途の設計メモ「host 化」参照)
- **C. 型の相互依存**
  - `_actions/types.ts` (`BoxBotActionContext`) ↔ `box-bot-model/index.types.ts`
    (`BoxBot3DConfig` / `BoxBotModelProps` / `BoxBotRefs`)。`import type` のみで実害なしだが循環。
    アクションが model の型の形を知っている
- **D. `use-box-bot-action-dispatcher` が `BOX_BOT_ACTIONS` を直参照**
  - Canvas 外 (story 直呼び) で Context 不可のため。カスタム `actions` prop 時に dispatcher が不整合
  - 方向: `useBoxBotActionDispatcher(eventTarget, actions?)` の第2引数化 (戻り値型はジェネリック)
- **E (補足). `use-click-bindings` が要素イベント 2 種をハードコード**
  - `ON_CLICK_BODY` / `ON_CLICK_HEAD` を `useEventListener` 2 回。部位追加 = この hook を編集。
    `ClickTarget` の値を回す形へ

### A の実装方針 (検討済み 2026-08-29)

現状の配線: `_actions/jump/config.ts` が `JumpConfig` 型 + `JUMP_DEFAULTS` 値を持つ。それを
box-bot-model が `BoxBot3DConfig.jump` (型) / `DEFAULTS.jump` (値 import) / `useBoxBotModel` の
`jump: { ...DEFAULTS.jump, ...opts.jump }` (マージ1行) の 3 箇所へ引き込んでいる。`useJump` は
`ctx.cfg.jump` をキー名込みで読む。

方針:

1. **`BoxBot3DConfig` を純ジオメトリ/見た目へ**。`jump` フィールド削除、`JumpConfig`/`JumpOverride`
   re-export 削除。`DEFAULTS` から `jump` キー削除、`JUMP_DEFAULTS` import 撤去。
   → `index.constants.ts` の値 import (`_actions` → box-bot-model 方向) が消え、C の実害部分も軽くなる。
2. **descriptor が `defaults` を持つ**。`defineAction` に `Config` 型パラメータ追加、
   `jumpAction = defineAction<'jump', JumpOverride, JumpConfig>({ ..., defaults: JUMP_DEFAULTS })`。
   `BoxBotActionConfigs<typeof BOX_BOT_ACTIONS>` を mapped type で導出 (`BoxBotActionDispatchers` と同手口)。
   `defaults` は optional (config なしアクション対応)。
3. **props は nested bag**。`BoxBotModelProps` に
   `actionConfig?: Partial<BoxBotActionConfigs<typeof BOX_BOT_ACTIONS>>` を追加。
   使い方: `<BoxBot3D actionConfig={{ jump: { liftPx: 200 } }} />`。per-action であることを型で明示。
4. **`use()` は generic ctx。config 復元は descriptor 内で行う**。
   - `BoxBotActionContext<Config = never>` を generic 化し `config: Config` を持たせる。
     `useJump(ctx: BoxBotActionContext<JumpConfig>)` は `ctx.config` を型付きで読む (`ctx.cfg.jump` 依存消滅)。
   - `defineAction<Name, Arg, Config>({ defaults, use })` が、内部で `use` を
     `(ctx: BoxBotActionContext) => use({ ...ctx, config: { ...defaults, ...ctx.actionConfig?.[name] } })`
     にラップして返す。per-action の `Config` 型は `defineAction` の型引数で保持され、ラッパー境界で確定。
   - orchestrator (`useBoxBotModel` の `for (const action of actions)`) は raw な
     `actionConfig: opts.actionConfig ?? {}` を base ctx に載せ `action.use(baseCtx)` を回すだけ。
     `AnyBoxBotAction` に潰れても `use` の中身はラップ済みなので型は緩まない。base ctx の型は
     `BoxBotActionContext` (= `BoxBotActionContext<never>`、`config` へはアクセス不可)。
   - defaults マージは descriptor 内に閉じる。`useBoxBotModel` の per-key マージ (`arm`/`body`/...) は現状維持、
     action ぶんの畳み込みループは持たない。
   - stringly な `actionConfig?.[name]` は `defineAction` 内部の 1 箇所のみ。アクション作者は触らない。
5. **`cfg` は ctx に残す** (純ジオメトリ化後の geometry/見た目参照用。将来 fall の `groundY` 算出等)。
   jump は `cfg` を touch しなくなる。

影響ファイル (各小): `_actions/types.ts` (generic ctx + `BoxBotActionConfigs` + ctx へ `actionConfig`) /
`_actions/define-action.ts` (`Config` 型パラメータ + `defaults` + `use` ラップ) / `_actions/jump/index.ts` (`defaults` 渡す) /
`_actions/jump/use-jump.ts` (`ctx.config` へ) / `box-bot-model/index.types.ts` (`jump` 削除・`actionConfig` prop 追加) /
`box-bot-model/index.constants.ts` (`JUMP_DEFAULTS` 撤去) / `box-bot-model/index.hooks.ts` (base ctx へ raw `actionConfig`)。

未整理: dispatch 時 1 回上書き (`JumpOverride` = `CustomEvent.detail`) は `Arg` 型パラメータ経由で別系統。
本方針は触らない。`Config` (既定) と `Arg` (1回上書き) は jump では両方 `JumpConfig` 系だが概念別、型パラメータは分ける。

### 次にやるなら

1. **A** (config を descriptor へ) — 型の穴が一番痛い
2. **B** (narrow host + adapter) — 接点最小化
3. D / E — 軽い
4. fall/spin 等の復帰 (削除したアクション群を新レジストリ形式で戻す)
5. ~~部位アンカーの戻り値まとめ (`layout`)~~ — 実装済み 2026-08-29、ブランチ 108-box-bot-layout-anchors。下記

### B の pilot (実装済み 2026-08-29、ブランチ 108-box-bot-action-host)

spin (one-shot) を 2 個目の consumer として復帰させ B を試作。

- host = `BoxBotActionHost` (`interactive` / `eventTarget` / `applySquash` / `applyLift` / `applyYawDelta`)。
  各アクションは `Pick` で narrow に受ける (`JumpHost` / `SpinHost`)。fat な base ctx (`cfg` / `refs` / `props` 丸ごと) 撤去
- adapter = `box-bot-model/index.hooks.ts`。THREE / DOM 書き込みは module scope の `write*` に隔離、
  render scope では ref オブジェクトを渡すだけ (`react-hooks/refs` 対策。`useMemo` ラップは不可、module scope 関数が正解)
- **C は副作用で消滅**: `_actions/types.ts` の import がゼロ。`box-bot-model → _actions` の一方向のみ、循環なし
- yaw 累積グループの ref を `spinRef` → `yawRef` へ改名 (spin 専用でなく spin / autoRotate が相乗り)
- spin の局所進行度 ref は `spinRef` のまま (`use-jump` の `jumpRef` と対)
- 残: `onFrame` / `onAction` は host に載せず r3f / `useEventListener` 直 import 継続。
  fall 復帰時に 3 個目の consumer で host 語彙を再検討

### 部位アンカーの戻り値まとめ (`layout`、実装済み 2026-08-29、ブランチ 108-box-bot-layout-anchors)

`useBoxBotModel` の戻り値のうち cfg から計算する部位配置 (`headY` / `headFront` / `shoulderX` / `shoulderY` /
`legX` / `legY`) をネスト化。アクセスは `layout.leg.x` / `layout.head.front` の形。

- コンテナ名 `layout` (部位の配置アンカー)
- 形: `{ head: { y, front }, shoulder: { x, y }, leg: { x, y } }`。2 階層固定 `layout.<部位>.<軸 | 意味>`
- 純関数 `deriveLayout(cfg): BoxBotLayout` を `box-bot-model/_lib/derive-layout.ts` へ切り出し、hook は呼ぶだけ。
  `__tests__/derive-layout.test.ts` で DEFAULTS からの導出値・スケール方向を検証
- `UseBoxBotModelReturn` の flat 6 キー → `layout` 1 つ。`BoxBotLayout` を `index.types.ts` に定義、各フィールド JSDoc。
  消費は `BoxBotModelInner` のみ
- raw 寸法直参照 (`cfg.body.w` / `cfg.eye.offset` 等) は `cfg.*` のまま
- 未実施 (fall 復帰時): `groundY` (脚下端) を `layout.ground.y` として追加。
  将来 host が raw `cfg` でなく `layout` (読み取り専用の派生幾何) を露出する形の下地
  (上記「A の実装方針」5 の「cfg は ctx に残す」を絞った版)
- **`refs` のネストは fall 復帰後に `layout` と対で再検討**。現状は `rootRef` / `yawRef` の 2 個のみで
  時期尚早。fall で `fallPivotRef` / `leftArmRef` / `rightArmRef` 等が増えてから、
  部位別ネスト (`refs.arm.leftRef` 等、葉の `Ref` サフィックスは維持。`refs.yawRef` も可) を判断

## 決定事項

- 2026-08-27: 案2 (表示領域中心で回転 + 設置領域の相対位置アニメ) を採用。fall 完全転倒を維持。Canvas 固定サイズ。
- 2026-08-27: 試作は samples を汚さず prototypes/box-bot/box-bot-01 で行う。assembly もローカルコピーし改変対象にする。
- 2026-08-27: コピー設置は #107 に切り出し。案2 の実装は別 issue とする。

## 懸念・リスク

- 設置領域 ref の Canvas 外配線は、UC-10 の別項目「layout 常駐 + createPortal + context 経由 props」と密結合。
  その設計が固まる前に配線を作り込むと手戻りの可能性。フェーズ 1 では暫定形 (体心その場回転、足元が浮く) で切り、
  container オフセットを後回しにする選択肢も残す。
- 体心回転にすると 90° 回転時に bot の縦横が入れ替わる。横倒し時の水平方向の広がり = 元の体高。
  固定 Canvas を「体高を収める正方形」にすれば足りるはずだが、影・ジャンプ余白との兼ね合いは実測次第。
- r3f Canvas はページ内絶対位置をずらすと内部描画がズレる既知現象あり (samples stories の Grid3D コメント参照)。
  設置領域 (Canvas の親) を動かす方式がこれに抵触しないか要検証。
