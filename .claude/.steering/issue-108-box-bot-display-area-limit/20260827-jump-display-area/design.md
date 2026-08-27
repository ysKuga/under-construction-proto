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
  - `assemblySize` のフォールバックは `DEFAULT_HEIGHT` (480px) 固定。`style.height` 数値指定時はその値。
  - `box-bot-01/index.tsx` の `BODY_HEIGHT_RATIO` re-export を削除 (外部消費者なし)。
- **ジャンプで表示領域ごと上下**:
  - `BoxBot3D` で `jumpLiftRef` (Canvas ラッパー div の ref) を生成。基準 `transform` は
    `translate(-50%, -50%)`。
  - `jumpLiftRef` を `BoxBotModel` 経由で Canvas 内の `use-jump-action` へ prop で渡す
    (Context は r3f Canvas 境界を越えないため prop 配線)。
  - `use-jump-action` の `useFrame` 内で、ジャンプ進行度から持ち上げ量 `JUMP_LIFT_PX * sin(pπ)` を算出し
    `jumpLiftRef.current.style.transform` を直接書き換える。`useState` を挟まず再レンダリングを避ける。
  - Canvas 内では squash (`rootRef` の scale) のみ制御。`rootRef.position.y` は不使用化。
  - `JUMP_H` (world 単位の上昇量) を撤去し `JUMP_LIFT_PX` (px、既定 40) へ置換。
  - `BoxBot3DProps` は `Omit<BoxBotModelProps, 'jumpLiftRef'>` とし内部配線 prop を公開型から除外。

## 詰めるパラメータ (実測要)

- `JUMP_LIFT_PX`: 現状 40px 仮。設置領域からの逸脱量として妥当かを実機で調整。
- `DEFAULT_HEIGHT` (設置領域 = Canvas の既定一辺): bot の見かけの大きさ (camera `fov` / `CAMERA_POSITION`)
  との兼ね合い。現状 camera 未調整のため bot が Canvas 内で小さめ。
- 影の追従: 現状は Canvas ごと持ち上がるため影も一緒に上がる。接地影として不自然でないか確認。

## 検証結果 (2026-08-27, Playwright headless)

- ジャンプ中、ラッパー `transform` が 0 → 約 `-39.8px` → 0 へ遷移 (`JUMP_DUR` 0.55s)。
- ラッパー div の実寸 480×480 = `assemblySize` (Canvas = 設置領域一致)。
- lint (oxlint) / tsc / prettier クリーン。

## 未対応 (親 issue フェーズ 1 側)

- fall の回転 pivot 変更・設置領域オフセットによる接地点辻褄合わせ。
- get-up の逆補間。
- 404 ページ `z-10` 手当て・`OrbitControls` target ずらしの不要化確認。
