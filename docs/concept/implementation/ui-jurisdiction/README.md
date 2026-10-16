# docs/concept/implementation/ui-jurisdiction

UI が扱う情報をその UI の担当範囲に限り、ゲーム要素との組合せを event listener 側へ寄せる構想について。\
[event-driven-ui](../event-driven-ui/README.md) の方針を、ゲーム要素の追加に備えて拡張する位置づけ。

find-path proto-03 で一部実装済み（判定結果の返却・セルクリックの集約）。\
表示用の判定・非同期の判定は未確定。

## 背景

今後のゲーム開発では、多数の要素（EN 等）が追加されていくと考えられる。

- 現状は、要素を追加するたびに UI の実装箇所へ判定が書き足されていく
  - 例: find-path proto-03 の EN 切れ時の経路選択（[issue-226 backlog](../../../../.claude/.steering/issue-137-top-page-transition-target/_closed/issue-226-waypoint-auto-move/backlog.md)）
    - 当時の対応案では、非隣接クリック・実行の処理へ EN 残量の確認を追加することになっていた
    - 現在は `FindPath-propose-path`・`FindPath-execute-path` の listener で判定する（下記「判定結果の返却」）
- 要素が増えるほど UI が各要素へ結合し、UI 自体の見通し・再利用性が下がる

## 構想

UI は担当範囲の情報のみを扱う。

- UI の担当範囲
  - 位置（クリックしたセル・経路等）
  - 開始・終了（経路の提示・実行・停止等）
- UI が扱わないもの
  - EN 等のゲーム要素

event によってアクションを定義し、UI と event listener の役割を分ける。

- UI
  - 担当範囲の情報を event で送信する
  - listener 側の処理結果を event で受信し、表示へ反映する
- event listener
  - 受け取ったデータを扱う
  - 必要なデータ（現在の EN 等）を自身で取得し、組み合わせて判定・処理する

## 期待する効果

- ゲーム要素の追加時、UI の実装箇所を変更せず listener 側の追加で済む
- 同一 UI を別の用途へ切り替えやすくなる
  - listener の組合せを差し替えるだけで、UI の実装は変えずに済む

## 対応状況

### 対応済み

- listener 側の判定結果（EN 不足で拒否する等）を UI へ返す方法
  - 案 1（cancelable event）を採用した（下記「判定結果の返却」）
- 複数の listener が同一アクションを判定する場合の合成方法
  - 案 1 により「1 つでも拒否すれば拒否」の形で合成される
  - 例: `FindPath-propose-path` を EN 切れ（`useEnergyPathGuardEventListener`）・充電中（`useChargingPathGuardEventListener`）の listener が `allowMultiple` で購読する
- クリックの分類の UI からの分離（下記「実装例: セルクリックの集約」）

### 未検討

- 非同期の判定（案 2 への拡張）
- 拒否理由の返却
- UI の表示（カーソル・移動可能マス表示・disabled 等）にも同じ判定を使う場合の扱い
  - 表示は再レンダリングを伴うため、[パフォーマンス方針](../../../performance/README.md)との両立が必要
  - 検討案は下記「表示用の判定」参照

## 判定結果の返却

アクション実行可否の判定結果を listener から UI へ返す方法の検討案。

### 案 1: cancelable event

UI は `cancelable: true` の event を発行し、listener は拒否時に `event.preventDefault()` を呼ぶ。\
`dispatchEvent` の戻り値が `false` であれば拒否されたと判断する。

```ts
// UI 側（位置・開始のみを扱う）
const accepted = dispatch(
  new CustomEvent('Path-request', { cancelable: true, detail: { cell } }),
)
if (!accepted) return

// EN listener 側
useEventListener('Path-request', (event) => {
  if (energyStoreApi.getState().getEnergyInfo(PLAYER_ACTOR_ID).current <= 0) {
    event.preventDefault()
  }
})
```

- 利点
  - DOM 標準の仕組みで、追加の仕組みが不要
  - 複数の listener のうち 1 つでも拒否すれば拒否となる。要素を追加しても UI 側は変更不要
  - 同期で判定が完結するため、UI はその場で分岐できる
- 欠点
  - 判定は同期に限られる（`await` 後の `preventDefault()` は効かない）
  - 拒否理由は返らない
    - 必要なら `detail` に `reject(reason)` 等を持たせ、listener に書き込ませる
- 必要な変更
  - `useEventDispatcher` が `dispatchEvent` の戻り値を返すようにする

### 案 2: dispatcher が listener の戻り値を集約して返す

listener の戻り値（`{ ok: false, reason }` 等）を dispatcher が集め、配列で返す。

- 利点
  - 非同期の判定にも対応できる
  - 拒否理由を返せる
- 欠点
  - pending Promise を管理している `_registries` を、戻り値も扱えるよう拡張する必要がある
  - 結果の合成方法（1 つでも拒否なら拒否、等）を UI または共通処理で決める必要がある

### 案 3: 結果通知用の event を別途発行する

`Path-request` を受けた listener が `Path-accepted`/`Path-rejected` を発行する。

- 利点
  - UI と listener の結合が最も緩い
- 欠点
  - listener が複数ある場合、どれが受理を発行するか決まらない（集約役が別途必要）
  - UI は結果を待つ必要があり、現状の同期的な流れ（クリック → その場で経路提示）と合わない

### 方向性

- 案 1 を採る（実装済み）
  - `useEventDispatcher` は `dispatchEvent` の戻り値を返す
  - find-path proto-03 の `_events` は全イベントを cancelable で発行する
- 非同期の判定が必要になった時点で案 2 へ拡張する

## 表示用の判定

カーソル・移動可能マス表示等は、アクションではなく「進入できるか」の問い合わせのため、event とは分けて扱う。

- 各要素が判定関数（ガード）を登録し、UI は合成された判定を呼ぶだけにする
  - find-path proto-03 の `enterGuards`（`check` と `kind` を持つ一覧）を、要素側から登録できる形へ広げるイメージ
- EN のように頻繁に変わる値は、判定を使う component 側で store を直接購読する
  - `MoveTargetLayer` と同じ形。上位で合成すると再レンダリングが配下へ波及する（PR #212 で解消した問題）

## 実装例: セルクリックの集約

find-path proto-03 のセルクリック（#345・#347・#346・#349）。\
汎用 UI（`Stage07`）と呼び出し側（find-path）の間で、本構想の役割分担を実装した例。

- 汎用 UI は発行のみ
  - `GeoLayer` はクリックしたセルを `Stage07-cell-click` で発行する
  - 現在セル・移動可・不可等の分類は行わない
- 分類は呼び出し側の listener が行う
  - `useCellClickEventListener` が `Stage07-cell-click` を購読し、移動・目標設定へ振り分ける
  - 同期で判定できる部分は純粋関数（`classifyCellClick`）へ切り出す
  - 分類結果は `match().exhaustive()` で振り分ける（[if-intent](../../../../.claude/rules/if-intent.md)）
- 処理から UI への命令は imperative handle
  - `Stage07Handle.moveTo` で移動を命令する
  - 拒否（進入不可）は戻り値の `boolean` で返す
  - handle は context（`Stage07HandleProvider`）で配布する
- 汎用 UI 単体での既定の挙動は、listener component で補う
  - `MoveOnAdjacentCellClick` が隣接クリックで `moveTo` を呼ぶ（story 等の単体利用向け）
  - 独自の分類を持つ呼び出し側では置かない
- 汎用 UI は呼び出し側を import しない
  - 表示と分類で共有する判定（`isCellSelectable`）は汎用 UI 側の `_lib` へ置き、双方から import する
  - `cursor: pointer` とクリックの挙動が同じ判定に揃う

## 関連

- [event-driven-ui](../event-driven-ui/README.md) — UI とロジックの分離（本構想の前提）
- [component-input-layers](../component-input-layers/README.md) — component の入力分離
- [issue-137 decision-records](../../../../.claude/.steering/issue-137-top-page-transition-target/decision-records.md) — セルクリックの集約の判断（2026-10-16）
