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
