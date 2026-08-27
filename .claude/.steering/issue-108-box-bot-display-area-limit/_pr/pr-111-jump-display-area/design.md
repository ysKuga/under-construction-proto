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
