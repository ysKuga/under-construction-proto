# TimeControl01

focus/blur/mousedown/mouseup の生イベントから click/drop を判定する状態機械のプロトタイプ。

## 状態遷移

`idle` → (mousedown) → `pressed` → (focusout) → `pressed-blurred` → (focus) → `pressed`

- `pressed` で mouseup → **click** 判定、`idle` に戻る
- `pressed-blurred` で mouseup → **drop** 判定、`idle` に戻る

focusout (フォーカス離脱) を「ポインタが元の要素から離れた」ことの代理指標として使う。

## スコープ外

ドラッグ中の座標追跡・表示は対象外。click/drop の確定のみ扱う。

## 構成

- `types.ts` — 型定義
- `reduce-pointer-state.ts` — 純粋な遷移関数
- `_hooks/use-pointer-state.ts` — 遷移結果 (`transition`) とイベント履歴 (`eventLog`) を保持する hook
- `index.tsx` — デモ用コンポーネント
