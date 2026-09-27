# キー押下処理の層管理（useKeyLayer）

issue: #137 / PR: #268（backlog「目標設定のキャンセル手段を追加する」）

## 目的

- ESC 等の汎用キーを 1 つの操作が占有しないようにする
- 中継点選択のキャンセル → 目標設定のキャンセルを、ESC 2 回押下で段階的に行えるようにする
- 今後のメニューを閉じる操作等も、同じ仕組みに載せられるようにする

## 背景・制約

- 現状は中継点選択キャンセル専用の ESC listener（`useEffectCancelWaypointSelectingOnEscape`）が window を直接購読している
- 同じ keydown を別の listener が購読すると、1 回の押下で複数段が進む
  - 例: 中継点選択キャンセルで `proposing` へ戻った直後、目標キャンセル側の listener がそれを見て `clear()` まで進む
- 中継点フローの状態は ESC 以外（`WaypointBubble` 再クリック・「完了」・実行・隣接移動等）でも変わる

## 方針

- 汎用 hook `useKeyLayer(key, handler, { enabled })` を `src/hooks/use-key-layer/` に新設する
  - key ごとの LIFO スタックを module singleton で持つ
  - window の keydown listener は 1 つのみ。層が 1 つ以上ある間だけ登録する
- 層の登録・解除は effect のライフタイムに結びつける
  - `enabled` が true になった時点で最上位へ積み、false・unmount で外す
  - 状態から導いた条件を `enabled` に渡し、層を実際の状態と一致させる
- 1 回の押下では、最上位から見て最初に `false` 以外を返した層だけが処理する
  - `false` を返すと下の層へ回す（「今は処理しない」判定用）
- IME 変換中（`isComposing`）の押下は扱わない

## 決定事項

- 「1 回実行したら配列から外す」「判定関数で外す」方式は採らない
  - ESC 以外の操作で状態が変わった場合に層が残り、状態と不整合を起こすため
  - 1 回きりの処理は、handler 内で状態を変えて `enabled` を false にすることで表現する
- 下の層へ回す仕組み（handler が `false` を返す）は最初から入れる
- 名前は `useKeyLayer`

## 懸念・リスク

- Radix（`react-dialog`/`react-dropdown-menu`）は独自に ESC を処理する
  - メニュー等を開いた状態の ESC で、Radix 側と層側の両方が動く可能性がある
  - 導入時、開いている間は層を積んで ESC を吸収させる等で対応する
- Tab は標準のフォーカス移動を持つ。奪うとアクセシビリティを損なうため、当面は ESC のみを対象とする
- input/textarea にフォーカスがある場合の除外は、必要になった時点で追加する

## 実装計画

- [x] PR 1: `useKeyLayer` とテスト（#268）
- [x] PR 2: proto-03 の ESC を `useKeyLayer` へ置き換え、目標設定のキャンセル（`proposing` での ESC → `clear()`）を追加する（#269）
