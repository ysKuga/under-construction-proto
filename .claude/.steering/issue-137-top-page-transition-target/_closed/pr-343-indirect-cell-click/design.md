# 通れない隣接マスのクリックを目標設定にする

PR: #343（親: #137 backlog「通行不能箇所で遮られた隣接マスのクリックを目標設定にする」）

## 目的

- 直接進入できない隣接マスのクリックを、迂回経路の目標設定にする
- 非隣接マスのクリックと同じ扱いに揃える

## 背景・制約

- `Stage07` の `useHexMove.handleCellClick` は、隣接マスで `canEnter` が false だと何もせず終わる
- `canEnterCell`（find-path proto-03）は以下を合わせた判定
  - 障害物
  - 一方通行
  - フェーズ
  - EN 残量
- 非隣接クリックのハンドラ（`useHandleNonAdjacentClick`）は BFS（`canEnterForPath`）で経路を求める
  - BFS は障害物・一方通行のみで判定し、EN は見ない。迂回経路は既存の仕組みで求まる
- 前段: #341（現在マスのクリックを無視する）

## 方針

- `handleCellClick` で直接移動できなかったクリックを、呼出し側へ委ねる
  - 対象: 非隣接マス・隣接だが進入できないマス
- prop `onNonAdjacentClick` は意味が変わるため `onIndirectClick` へリネームする
  - proto-03 のハンドラ・ファイル名も合わせる（`useHandleIndirectClick`）
- 通れない理由によらず全て目標扱いにする
  - 障害物: 到達不能の通知
  - EN 切れ: 吹き出しを揺らす
  - 一方通行: 迂回経路を提示

## 懸念・リスク

- 通れない隣接マスへ `cursor: pointer` が付かず、挙動と表示がずれる
  - 後続 PR（`137-indirect-cell-pointer`）で揃える
