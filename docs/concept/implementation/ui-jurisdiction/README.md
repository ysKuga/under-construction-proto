# docs/concept/implementation/ui-jurisdiction

UI が扱う情報をその UI の担当範囲に限り、ゲーム要素との組合せを event listener 側へ寄せる構想について。\
[event-driven-ui](../event-driven-ui/README.md) の方針を、ゲーム要素の追加に備えて拡張する位置づけ。

初期の構想段階。実装方針は未確定。

## 背景

今後のゲーム開発では、多数の要素（EN 等）が追加されていくと考えられる。

- 現状は、要素を追加するたびに UI の実装箇所へ判定が書き足されていく
  - 例: find-path proto-03 の EN 切れ時の経路選択（[issue-226 backlog](../../../../.claude/.steering/issue-137-top-page-transition-target/_closed/issue-226-waypoint-auto-move/backlog.md)）
    - 対応案では `handleNonAdjacentClick`・`handleExecuteClick` へ EN 残量の確認を追加することになる
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

## 未検討事項

- listener 側の判定結果（EN 不足で拒否する等）を UI へ返す方法
  - 現状の `useEventDispatcher` は listener の完了を待つのみで、結果は返さない
  - 検討案は下記「判定結果の返却」参照
- 複数の listener（EN・今後追加される要素）が同一アクションを判定する場合の合成方法
  - 案 1 であれば「1 つでも拒否すれば拒否」の形で自然に合成される
- UI の表示（カーソル・移動可能マス表示等）にも同じ判定を使う場合の扱い
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

### 暫定の方向性

- 案 1 を採る
- 非同期の判定が必要になった時点で案 2 へ拡張する

## 表示用の判定

カーソル・移動可能マス表示等は、アクションではなく「進入できるか」の問い合わせのため、event とは分けて扱う。

- 各要素が判定関数（ガード）を登録し、UI は合成された判定を呼ぶだけにする
  - find-path proto-03 の `enterGuards`（`check` と `kind` を持つ一覧）を、要素側から登録できる形へ広げるイメージ
- EN のように頻繁に変わる値は、判定を使う component 側で store を直接購読する
  - `MoveTargetLayer` と同じ形。上位で合成すると再レンダリングが配下へ波及する（PR #212 で解消した問題）

## 関連

- [event-driven-ui](../event-driven-ui/README.md) — UI とロジックの分離（本構想の前提）
- [component-input-layers](../component-input-layers/README.md) — component の入力分離
