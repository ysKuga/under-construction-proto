# 複数マス選択（予定経路）の実装方針

予定経路（planned-path）へ複数セルを積み上げる UI の実装方針。[docs/concept/README.md](../../README.md) の一覧の詳細。

## 課題

- 同一セルへの重複選択を許可するかどうかは実装ごとに揺れやすい
- 選択済みセルの番号表示（1マスに複数回選択された場合の見た目）は、tick駆動の「実行」で1手ずつ消化される過程に応じて更新する必要があるが、更新機構ごと理解せずに別実装へ移植すると期待した挙動にならない（下記「既知の問題」参照）

## 方針

### 重複選択

- デフォルトは重複不可（同一セルへの複数回選択を許可しない）
- 重複許可は proto-01 `allowDuplicateSelection` のような比較試作用オプションに留め、既定値としては採用しない

### 選択済み表示のフェードアウト

現状（proto-01 `PlannedPathLayer`、`variant: 'list'`）の実装:

- セルの背景・枠線（選択済み表示）は `plannedPath` store 由来の `hasOrders`（React state）を根拠にした静的な値
- しかし `plannedPath` store 自体は「実行」開始時（`execute()`）に一括で実行用の `path` store へコピーされるだけで、tick 消化中は不変のまま保持される（歩き切るまで表示用に残す設計）
- そのため「1手ずつ消化されるにつれ選択済み表示が消えていく」演出は React の再レンダリングでは実現できず、`PlannedPathCellRegistryProvider`（DOM 直書き、`fadeOutCell`/`fadeOutStep`/`resetAllSteps`）に完全に依存している
- `fadeOutCell` は tick ドライバ（`useFindPathTick`）側が「そのセルの残り出現回数が0になったタイミング」を判定して明示的に呼び出す

## 既知の問題

proto-03（hex, issue #181 PR-C）へ「予定経路+実行」方式を移植した際、`PlannedPathCellRegistryProvider` 相当の DOM 直書きフェードアウト機構を持ち込まず、`plannedPath` store の selector 購読のみで表示する簡易実装にした（YAGNI 判断）。

結果、tick 実行中は `plannedPath` store 自体が変化しないため、1マスずつ消化されても選択済みセルの表示（背景・番号）が実行完了までフェードアウトせず残り続ける不具合が発生した。

この移植（proto-03 側のtick駆動実装本体）は挙動問題のため revert 済み（PR #188）。再実装時は次のいずれかで表示更新を成立させる必要がある。

- `PlannedPathCellRegistryProvider` 相当の DOM 直書き機構を正しく移植する
- tick 消化に応じて `plannedPath` store（または別の React state）自体を更新する設計に作り直す

## 関連

- 実装例: [proto-01/_components/planned-path-layer](../../../../src/components/pages/find-path/_prototypes/proto-01/_components/planned-path-layer/index.tsx)
- フェードアウト機構: [proto-01/_contexts/planned-path-cell-registry](../../../../src/components/pages/find-path/_prototypes/proto-01/_contexts/planned-path-cell-registry/index.tsx)
- 経緯: `.claude/.steering/issue-137-top-page-transition-target/_issues/issue-181-en/decision-records.md`
