# グリッド→ヘクス表示の試作

issue: #162

## 目的

正方格子グリッド表示のヘクス(六角形)表示化、試作スコープで検証。

## 背景・制約

- find-path (#137) design.md 178行目「（将来検討）グリッド（正方形マス）からヘクス（六角形マス）表示への変更。今回はスコープ外、着手時期未定」の後続検討
- 現状実装（stage-04〜06 `GeoLayer`）は正方格子 `{col, row}` 前提
  - CSS Grid（`gridTemplateColumns`/`gridTemplateRows`/`gridColumn`/`gridRow`）依存
  - 隣接判定は4/8方向決め打ち（proto-02 `isAdjacent`）
  - visibility registry で大半セル非表示時、CSS Grid の auto-placement が可視セルを詰めて再配置するバグ経験済み（find-path design.md 151行目）
- stage-05/06 の遠近表現（CSS `perspective` + `rotateX` 床面台形化、`usePerspectiveControl` による ref 直書き）は流用検討対象

## 実装計画

- [ ] 座標系: axial `{q, r}` 新設（既存 `{col, row}` は流用せず、hex 専用の型・隣接判定を新規作成）
- [ ] 隣接判定: 6方向固定オフセットで `isHexAdjacent` 新設
- [ ] 配置先: 新規 `src/prototypes/stage/stage-07`（既存 stage-06 は温存、比較用に残す）
- [ ] レイアウト: CSS Grid 廃止 → absolute 配置（%計算）+ 各セル `clip-path: polygon(...)` で六角形化
  - flat-top（辺が上下）で確定。奇数列を半セル分縦ずらし（offset-col）
- [ ] 到達点（試作スコープ）: 六角セル描画 + クリックで隣接移動まで
  - visibility registry・time-control 統合は対象外
- [ ] 検証手順: tilt=0（傾きなし）でまず hex 描画・隣接移動を確認 → 傾き（rotateX）を入れて列オフセット方向の歪みを目視確認

## 決定事項

- 2026-09-14: issue #162 起票。find-path (#137) design.md 178行目のスコープ外項目を分離
- 2026-09-14: 座標系は axial `{q, r}` に決定。offset 座標だと隣接・視界計算が既存正方格子と地続きにならず破綻するため
- 2026-09-14: hex の向きは flat-top に決定
- 2026-09-14: 新規 stage は既存命名（stage-04/05/06）に連番、`stage-07` とする。既存 stage-06 は変更せず比較用に残す
- 2026-09-14: レイアウト方式は CSS Grid を廃止し absolute 配置 + `clip-path` へ変更。CSS Grid は矩形前提で hex オフセットに乗らないため。副次的に、visibility registry 併用時の auto-placement 詰まりバグ（find-path 実装で発生済み）も構造的に回避できる見込み
- 2026-09-14: 試作到達点は「六角セル描画 + クリックで隣接移動」までに限定。visibility/time-control 等の統合は今回のスコープに含めない

## 懸念・リスク

- flat-top + 傾いた床（`rotateX`）の組合せで、列オフセット方向の縦ずれが目立ちやすい懸念（傾き軸とオフセット軸が直交するため）。tilt=0 から段階的に検証する方針
- 遠近表現との組合せ全般が未検証（stage-05/06 は正方格子前提で検証済みのため、hex 特有の歪みが新規に出る可能性）
- 本試作の採否・find-path（#137）本実装への適用可否は別途判断（今回はスコープ外のまま）
