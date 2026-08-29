# ジャンプ時の表示領域上下移動 (box-bot-01)

親: [issue-108 box-bot アクション範囲 (表示領域) の限定](../design.md)

## 目的

`#108` フェーズ 1 のうち、ジャンプ (jump / hopping) 分の可動域確保方法を先行して試作する。
fall (完全転倒) は対象外。案2 本体とは独立して評価できる小さい変更に絞る。

## 方針

ジャンプの縦移動を Canvas 内 (`rootRef.position.y`) でなく、表示領域 (Canvas を包む DOM ラッパー) の
`transform` 上下移動で行う。設置領域 (`Assembly`) は動かさない。Canvas が設置領域を上方向へ逸脱することで
可動域を確保する。

## 変更内容

- **zoom 無効化**: `OrbitControls` に `enableZoom={false}`。ドラッグ回転は維持。
- **Canvas = 設置領域サイズ**:
  - `BODY_HEIGHT_RATIO` 逆算・`VERTICAL_OFFSET_RATIO` / `verticalOffsetPx` を撤去。
  - `heightPx` (設置領域の約 2 倍) を廃止し、Canvas の幅・高さを `assemblySize` (= 設置領域) に一致させる。
  - `assemblySize` のフォールバックは `DEFAULT_HEIGHT` 固定。`style.height` 数値指定時はその値。
  - `box-bot-01/index.tsx` の `BODY_HEIGHT_RATIO` re-export を削除 (外部消費者なし)。
- **Canvas を bot ぴったりへ縮小**:
  - `DEFAULT_HEIGHT` 480 → 290 (bot を少し囲う余白)。
  - `fov` を明示指定なければ `assemblySize` から自動算出。`REFERENCE_HEIGHT` (480) / `REFERENCE_FOV` (64)
    を較正基準に `assemblySize / tan(fov/2)` を一定化 → Canvas サイズを変えても bot の画面上 px は不変。
  - `ORBIT_TARGET` を `[-0.15, 0.2, 0]` へ較正し縮小 Canvas 中央へ直立 bot を収める。
- **ジャンプで表示領域ごと上下**:
  - `BoxBot3D` で `jumpLiftRef` (Canvas ラッパー div の ref) を生成。基準は `top: 50%` +
    `transform: translate(-50%, -50%)`。
  - `jumpLiftRef` を `BoxBotModel` 経由で Canvas 内の `use-jump-action` へ prop で渡す
    (Context は r3f Canvas 境界を越えないため prop 配線)。
  - `use-jump-action` の `useFrame` 内で、ジャンプ進行度から持ち上げ量 `liftPx * sin(pπ)` を算出し
    `jumpLiftRef.current.style.top` を直接書き換える (`calc(50% - Npx)`)。`useState` を挟まず再レンダリング回避。
  - **`transform` でなく `top`**: ラッパーへの `transform` 変更は r3f Canvas の描画レイヤーが再合成されず
    画面上動かなかった (design.md 懸念③が的中)。`top` は canvas 描画ごと移動する。
  - Canvas 内では squash (`rootRef` の scale) のみ制御。`rootRef.position.y` は不使用化。
  - `JUMP_H` (world 単位の上昇量) を撤去。
  - `BoxBot3DProps` は `Omit<BoxBotModelProps, 'jumpLiftRef'>` とし内部配線 prop を公開型から除外。
- **ジャンプパラメータの引数化**:
  - `BoxBot3DConfig.jump: { liftPx, durSec }` を追加、`DEFAULTS.jump` (`liftPx: 130`, `durSec: 0.55`) へ集約。
    既存 `arm`/`body`/`leg` と同じくグループ化 props + 部分上書き。`JUMP_DUR` / `JUMP_LIFT_PX` 定数は撤去。
  - `useBoxBotActionDispatcher().jump(override?)` が 1 回ごとの上書きを受ける。
    `CustomEvent(ACTION_JUMP, { detail })` で運ぶ。`use-jump-action` が開始時に `(override ?? cfg.jump)` を
    `jumpConfigRef` へ確定し `useFrame` がそれを読む。hopping 起点は `jumpConfigRef` を立てず `cfg.jump` へ fallback。
  - 専用 `Jump` story: Jump ボタン + lift/dur スライダー。

## 詰めるパラメータ (実測要)

- `DEFAULTS.jump.liftPx` (既定 130px)・`durSec` (既定 0.55s): 用途ごとに props / dispatch override で調整。
- `DEFAULT_HEIGHT` (290) と bot の見かけの大きさ (`fov` 自動算出の基準 `REFERENCE_HEIGHT`/`REFERENCE_FOV`)。
- 影: 現状 `shadowOpacity` を story 側で 0。Canvas ごと持ち上がるため影も一緒に上がる問題は保留。

## 検証結果 (2026-08-27, Playwright headless)

- ジャンプ中、ラッパー `top` が `calc(50% - 0px)` → 約 `-127px` (既定) → 0 へ遷移。bot が設置領域の枠を飛び出す。
- `Jump` story: dispatch override で peak lift ≈ 130 (既定) / ≈ 400 (スライダー最大) を確認。
- ラッパー div の実寸 = `assemblySize` (Canvas = 設置領域一致)。
- lint (oxlint) / tsc / prettier クリーン。

## 未対応 (親 issue フェーズ 1 側)

- fall の回転 pivot 変更・設置領域オフセットによる接地点辻褄合わせ。
- get-up の逆補間。
- 404 ページ `z-10` 手当て・`OrbitControls` target ずらしの不要化確認。

---

## フォローアップ検討: アクションの追加/削除をしやすくする

PR #111 レビューで挙がった論点。実装は別途 (box-bot-01 で直接)。現時点は設計メモのみ。

### 現状: 1 アクション追加で触る箇所 (jump 追加時の実績)

7 ファイル・11 箇所:

- `index.constants.ts`: `ACTION_XXX` 定数、`XXX_*` チューニング定数
- `index.types.ts`: `BoxBotRefs` に `xxxRef` / `UseBoxBotActionDispatcherReturn` に `xxx()` /
  `BoxBot3DConfig` に `xxx: {}` / `UseBoxBotModelReturn` の Pick
- `index.contexts.tsx` (`BoxBotRefsProvider`): `useRef` + `useMemo` オブジェクト + deps 配列 (1 ファイル 3 箇所)
- `_action-hooks/use-xxx-action.ts`: 新規 (ロジック本体、不可避)
- `index.hooks.ts`: import + 呼出 + (JSX 用なら) ref 分割代入 + return オブジェクトへ追加
- `use-box-bot-action-dispatcher.ts`: `xxx: () => dispatch(...)`
- `index.tsx` (`BoxBotModelInner`): `xxxRef` を `<group>` に配線 (transform 駆動なら)
- (`index.stories.tsx`: story)

### 摩擦の主因

- **中央 ref レジストリ** (`BoxBotRefsProvider`): 全アクションの ref を 1 箇所で宣言・memo 化・deps 列挙。
  `jumpConfigRef` 追加時も 3 箇所同期。アクション単位のカプセル化なし。
- **dispatcher の 3 重定義**: アクション名が「定数」「dispatcher メソッド」「戻り値型キー」に手動で 3 回出る。
- **orchestrator** (`index.hooks.ts`): import / 呼出 / ref / return の最大 4 編集。
- **config マージ**: `{ ...DEFAULTS.x, ...opts.x }` を手で 1 行追加。

### 案A: アクションレジストリ (descriptor 配列) ★推奨方向

各アクション = 1 フォルダ `_actions/<name>/index.ts` が descriptor を export:

```ts
export const jumpAction = defineAction({
  name: 'jump',
  event: 'BoxBot-action-jump',
  defaults: { liftPx: 130, durSec: 0.55 }, // → cfg.jump に合流 (任意)
  use: (ctx) => {
    /* useEventListener + useFrame。ref は use() 内で自前 useRef */
  },
})
```

`_actions/index.ts` に `export const ACTIONS = [jumpAction, spinAction, fallAction, ...]`。

- orchestrator: `for (const a of ACTIONS) a.use(ctx)` — 固定順ループ。モジュール定数配列なので Rules of Hooks OK。
  アクション追加でこのファイルを触らない
- dispatcher: `ACTIONS` から生成。戻り値型も mapped type で導出 → 3 重定義解消
- config / DEFAULTS: `ACTIONS` の `defaults` を畳んでマージ → per-action 行なし
- ref: 各アクションが `use()` 内で `useRef` を持つ。中央 provider から出る
- 本当に共有される ref だけ小さな core context に残す (`rootRef` / `postureRef` / `botHoverRef` /
  JSX バインドする physique group ref)
- hopping が `jumpRef.current = 0` を直接叩く件 → `ACTION_JUMP` を dispatch する形にすればアクション間の
  内部依存が消える

→ 追加 = フォルダ作成 + 配列に 1 行。削除 = フォルダ削除 + 1 行削除。

### 他案

- **案B (レジストリ最小)**: 中央 ref provider は残しつつ `ACTIONS` から生成し memo-deps footgun を消す。
  co-location は案 A より弱いが移行小
- **案C (アクションごと Context provider を合成)**: `ACTIONS.reduce` で provider をネスト。分離は綺麗だが
  provider ネスト深さ = アクション数、`useFrame` 実行順が読みにくい
- **案D (現状維持 + 型で網羅チェック)**: `satisfies Record<ActionName, ...>` で dispatcher の記入漏れを
  コンパイルエラーに。編集数は減らない

### 実装前に確認・検証する点

- **hooks-in-loop の lint**: `a.use()` を `for` / `map` で回すのを oxlint の `rules-of-hooks` が許すか。
  ダメなら `useActions()` ヘルパを hook 扱いさせる or 行単位 disable
- **`useFrame` 実行順依存**: 現状は `index.hooks.ts` の呼出順が暗黙の契約 (fall と jump の scale 書き込み等)。
  配列順 = 実行順として明文化する
- `interactive` ゲート・マウント時 `autoWalk` / `hopping` 初期化を descriptor のどこへ置くか (`onMount(ctx)` 等)
- `_action-hooks/` → `_actions/` のリネーム是非 (命名一貫性ルール)
- 移行は box-bot-01 で直接 (別 PR 想定)

---

## 実装済み: 案A + Context 注入 (box-bot-01、PR #111 ブランチ)

案A (レジストリ) を jump のみで試作し、その後 Context 注入まで進めた。fall/spin 等は
検証しやすさのため一旦全削除 (別途復帰予定)。

### やったこと (コミット順)

- `05bb671` jump をレジストリへ切り出し。`_actions/jump/` (config / use-jump / descriptor)、
  `BOX_BOT_ACTIONS = [jumpAction]`、`for (const a of BOX_BOT_ACTIONS) a.use(ctx)`。
  `BoxBotRefsProvider` から `jumpRef`/`jumpConfigRef` を除去 (アクション内 `useRef` へ)。
  hopping は `jumpRef` 直叩き → `ACTION_JUMP` dispatch へ
- `f99a2f5` `defineAction` を `_actions/types.ts` (型のみ) から `_actions/define-action.ts` へ分離
- `7e02a1b` box-bot-01 を jump のみへ縮小 (spin/fall/getUp/arm/leg/autoRotate/bodyBobbing/hopping 削除、
  非 jump 定数・型・ref・dispatcher メソッド・stories を削除、bot 静止)
- `d5ca582` click→jump を binding 層で分離。bot は `ON_CLICK_BODY`/`ON_CLICK_HEAD` を発行、
  `use-click-bindings` が対応表で action イベントへ中継、`DEFAULT_CLICK_BINDINGS` は
  `jumpAction.event` 由来。`clickBindings` prop で上書き
- `d0f2621` `CLICK_BODY/HEAD` → `ON_CLICK_BODY/HEAD` へ改名
- `67d6358` `emitClick` → `createClickEmitter` (ハンドラ生成ファクトリなので `create*` 命名)。
  部位ごとの割当 (`ON_CLICK_BODY` を渡す) は `BoxBotModelInner` へ
- `343ccc2` **`_actions/` を `box-bot-model/` から `box-bot-3d/` 直下へ移動**。
  `BoxBot3D` が `actions?` / `clickBindings?` を props で受け、`?? BOX_BOT_ACTIONS` /
  `{ ...DEFAULT_CLICK_BINDINGS, ...clickBindings }` を解決 → `<BoxBotModel>` へ (Canvas 境界越え) →
  `BoxBotActionsProvider` で Context 化 → `useBoxBotModel` / `useClickBindings` が
  `useBoxBotActions()` で参照。`box-bot-model` は `BOX_BOT_ACTIONS` /
  `DEFAULT_CLICK_BINDINGS` の**値**を import しない
- 付随: `bd72dc5` bot 表示位置を Canvas 中央へ較正、`fc361d3` 腕を軽く外へ開く (見た目調整)

### 疎になった軸

- 登録・発見: 注入 (`_actions/index.ts` の配列 + Context)。追加 = フォルダ + 1 行、削除 = 逆
- orchestrator: `for (const a of actions) a.use(ctx)` のみ。特定アクションを import しない
- dispatcher: 配列から `Object.fromEntries` で生成、型も `BoxBotActionDispatchers<typeof BOX_BOT_ACTIONS>`
- click → action: data table (`clickBindings`)、注入・上書き可。要素イベントと action イベントは互いを参照しない
- アクション固有 ref (`jumpRef` 等) は `_actions/<name>/use-*.ts` 内に閉じる
- hooks-in-loop: oxlint `rules-of-hooks` は `for..of` (モジュール定数配列) を許容 (検証済み)

## 残る結合 (ABCD、優先度順)

- **A. config が bot の型に穴を開けている (★最優先)**
  - `BoxBot3DConfig.jump: JumpConfig` / `DEFAULTS.jump = JUMP_DEFAULTS` — bot の config 型・既定値に
    jump 専用フィールド。jump を消すと宙に浮く。config を持つアクション追加 = bot の型を編集
  - 方向: descriptor に `configSchema` / `defaults` を持たせ bot が動的マージ。
    `BoxBot3DConfig` から per-action フィールドを消し `cfg.actionConfig[name]` 等へ
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

## 次にやるなら

1. **A** (config を descriptor へ) — 型の穴が一番痛い
2. **B** (narrow host + adapter) — 接点最小化
3. D / E — 軽い
4. fall/spin 等の復帰 (削除したアクション群を新レジストリ形式で戻す)

## 完了: `box-bot-3d/` を `box-bot-01/` 直下へフラット化

PR #111 マージ後、別 PR #112 で実施。

- `box-bot-01/_components/box-bot-3d/` 配下
  (`index.tsx` / `index.types.ts` / `_actions/` / `_components/` / `_lib/`) を
  `box-bot-01/` 直下へ `git mv`
- 理由:
  - `box-bot-01/_components/` 配下が `box-bot-3d/` ただ 1 つ。冗長なネスト
  - `box-bot-01/index.tsx` は re-export barrel のみだった
- 結果:
  - barrel の `box-bot-01/index.tsx` を廃止、`BoxBot3D` 本体を `index.tsx` へ
  - `index.stories.tsx` の import 追従 (`BoxBot01` named re-export → default import)
  - `box-bot-3d/` 配下の相対 import は同ディレクトリ内で完結 → 内部 import は無変更。
    外部参照は stories のみ
  - 付随: `box-bot-model/index.constants.ts` の import group 空行補正
    (移動前から存在した eslint `import/order` 違反を解消)
