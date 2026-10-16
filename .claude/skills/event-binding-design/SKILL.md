---
name: event-binding-design
description: インタラクティブな UI の実装前に、UI と処理を event で結び付けられるかを確認し、event・listener・handle の設計を決めて steering へ記録する。「event で結び付けられるか」「UI と処理の役割分担を検討」「event 設計」等の依頼時、またはクリック・操作を伴う UI の実装計画を立てる時に使用する。実装後の確認は rules-reviewer を使う。
---

## 引数

`$ARGUMENTS`: 実装しようとしている UI・操作（例: `proto-03 の目標セルのドラッグ`）

## 手順

### 1. 方針を読む

記憶に頼らず、毎回ファイルから読む。

- `docs/concept/implementation/ui-jurisdiction/README.md`（実装例: セルクリックの集約）
- `docs/concept/implementation/event-driven-ui/README.md`
- `.claude/rules/event-ui-jurisdiction.md`
- `.claude/rules/event-driven-actions.md`

### 2. 対象の現状を読む

- 対象 UI の component と、同じ部品配下の `_events/`（event dictionary 型・`_event-listeners/`）
- 汎用 UI（`Stage07` 等）を使う場合、その handle・`_lib`・既存 event

### 3. 確認項目ごとに案を出す

以下を順に確認し、案をユーザーへ提示する。\
判断が分かれる項目は選択肢と推奨を示す。

1. UI の担当範囲
   - UI が発行する情報（位置・開始・終了）
   - UI が持たない判定（現在・移動可・不可等の分類、EN 等のゲーム要素）
2. event
   - 命名: 同じ部品の既存 event（`Stage07-cell-click`・`FindPath-*` 等）と形をそろえる
   - 拒否の要否
     - あり: cancelable で発行し、listener が `preventDefault()` する。dispatcher の戻り値で判定する
     - 非同期の判定・拒否理由が要る: ui-jurisdiction の案 2 の検討へ回す（未対応のため明記して止める）
   - 複数の listener で判定するか（`allowMultiple`）
3. 分類
   - 同期で判定できる分類は純粋関数へ切り出す（`classifyCellClick` の形）
   - 分類結果の振り分けは `match().exhaustive()`（[if-intent](../../rules/if-intent.md)）
4. 処理から UI への命令
   - imperative handle を使うか（`Stage07Handle.moveTo` の形）。拒否は戻り値で返す
   - handle を context で配布するか
5. 表示と分類で共有する判定
   - 汎用 UI 側の `_lib` へ置き、双方から import する（汎用 UI は呼び出し側を import しない）
   - 判定が依存する値と、再レンダリングの範囲への影響（[docs/performance](../../../docs/performance/README.md)）
6. 汎用 UI 単体での既定の挙動
   - story 等の単体利用向けに listener component（`MoveOnAdjacentCellClick` の形）が要るか
7. event で結び付けない方が適切か
   - 例: 部品の所有物であるプロパティ
   - 根拠: event-driven-ui「プロパティとロジックの分離」
   - 該当する場合: その旨と理由を示す

### 4. steering へ記録する

ユーザーの承認後、対応する steering へ記録する（[.claude/.steering/CLAUDE.md](../../.steering/CLAUDE.md)）。

- 決定事項・判断根拠: decision-records.md
- 実装計画: backlog.md。実装順序は event-driven-actions に従う
  1. event の定義（発火・購読の配線のみ）
  2. 挙動の検討
  3. 挙動の実装
- PR 分割が要る場合は依存関係付きで提示する（[pr.md](../../rules/pr.md)）
