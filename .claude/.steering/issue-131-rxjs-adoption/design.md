# rxjs を実コードへ適用する

issue: #131（rxjs 適用のため reopen。元テーマの実装は `_closed/issue-131-top-page-revamp/` で完了済、rxjs 適用のみ積み残し）

## 目的

導入済で未使用の rxjs（`rxjs@7.8.2`, PR #133）を実コードへ適用する。issue #131 close 時の積み残し 3 項目（`jumpCount` の Observable 化 / 長押し util / 挙動と UI の分離）を消化し、時間軸を持つ操作・非同期を operator 合成で宣言的に書く型を作る。

## 背景・制約

- rxjs は PR #133 で先行導入済。`src/` で未使用。方針は [docs/package/reactive/rxjs/README.md](../../../docs/package/reactive/rxjs/README.md):
  - 長押しなど文脈のある操作（押下 → 保持 → 解放）の判定
  - 複雑な非同期・イベント連鎖を状態フラグでなく operator 合成で記述
  - 見た目に干渉しない値の流れを Observable へ寄せ、React の再レンダリングと分離（判断基準は `docs/performance/README.md`）
  - v7 系。operator は `rxjs` から直接 import（`rxjs/operators` サブパスは非推奨）
- issue #131 close 時の積み残し（`_closed/issue-131-top-page-revamp/design.md` 実装計画）:
  - `jumpCount` 等の操作 state を Observable へ寄せ、しきい値超え判定の boolean のみ state 化
  - 「ジャンプ回数」か「クリック回数」かを確定（`ACTION_JUMP` 購読 vs `onClick`）
  - 長押し検出 util を rxjs で作る（box-bot spin の press/release と接続できるか検討）
  - 挙動（制御ロジック）と操作 UI 要素を別ディレクトリに分離（`_prototypes/` 配下、アンダーバー不要、UI 側は形状を反映した名前）
- rxjs と React state の境界は都度判断（`docs/performance/README.md` の基準）

## 適用候補（検討結果）

### A. time-control tick ドライバの rxjs 化 — 段階 3（#137）と直結

- 現状 `src/prototypes/time-control/time-control-03/_stores/position/store.ts` の `continueAuto` = 手書きの再帰 `setTimeout` + fixed-step accumulator + `timeScale` ポーリング + path 枯渇で停止
- rxjs 化イメージ:

  ```
  timer(0, REALTIME_STEP_MS).pipe(
    withLatestFrom(timeScale$),        // ポーズ (timeScale 0) も自然に扱える
    scan(tickMs 消化の accumulator),
    mergeMap(ticks => from(ticks)),     // 1 手ずつ流す
    takeWhile(() => path 残あり),        // 枯渇で complete
  ).subscribe(applyNextStep)
  ```

- `timeScale` を `BehaviorSubject` にすれば `withLatestFrom` で毎 step 反映（現ポーリングと等価だが宣言的）。早送り・**巻き戻し**（親 design.md の time-scale / progress-mode UI）も operator 合成で乗せやすい
- 複数 actor の並行 tick（`dispatchActions` の setTimeout 群）は `merge` / `groupBy` で束ねられる
- **段階 3 の PR-C（tick ドライバ移植）でどうせ書き直す箇所。移植と同時に rxjs 化するのが最も自然**
- 懸念: r3f `useFrame`（実時間）と tick（論理時間）の二層。元々別レイヤなので衝突しないが、境界を段階 3 design に明記する
- **このリポジトリの管轄外**。実装は #137 段階 3 PR-C 内で行う。ここは方針リンクのみ

### B. proto-01 の `jumpCount` → 歩く解放（#131 積み残しそのもの）

- `src/components/pages/home/_prototypes/proto-01/index.tsx`: `useState(jumpCount)` でクリック毎に再レンダリング。UI に効くのは `walkUnlocked`（`jumpCount >= 3`）の boolean のみ
- rxjs 化イメージ:

  ```
  unlocked$ = jump$.pipe(
    scan(count => count + 1, 0),
    map(count => count >= JUMPS_TO_UNLOCK_WALK),
    distinctUntilChanged(),
    filter(Boolean),
    take(1),
  )
  ```

- 連番 `jumpCount` は state から外し、`walkUnlocked` の `false → true` 1 回だけ state 化（`useSyncExternalStore` か `useState` + `useEffect(subscribe)`）→ 解放前の無駄再レンダリングが消える
- 「ジャンプ回数 vs クリック回数」は `jump$ = fromEvent(eventTarget, ACTION_JUMP)` で `ACTION_JUMP` 購読に確定（rxjs 的にきれい。`onClick` カウントは box-bot 内部の判定と二重になる）
- proto-01 は `samples/figure/box-bot` を使用。actor 版 box-bot への差し替えは別軸なので本 PR では触らない
- **C の長押し util 完成後に着手**（同じ Observable → boolean 橋渡しの型を使うため）

### C. 長押し検出 util（押下 → 保持 → 解放）— rxjs の花形

- `docs/package/reactive/rxjs` が名指しする用途。現状該当実装なし（`src/components/theater/figure/box-bot/box-bot-01/_actions/spin/use-spin.ts` は単発クリック起動）
- rxjs 化イメージ:

  ```
  longPress$ = (down$, up$) =>
    down$.pipe(
      mergeMap(() =>
        timer(HOLD_MS).pipe(takeUntil(up$), mapTo('long')),
      ),
    )
  // down 直後に up = 通常クリック扱い、HOLD_MS 保持 = 長押し
  ```

- 配置: 共通 util。既存 `@/hooks/event`（EventTarget ベース）と組み合わせる形。`src/hooks/` 配下に `use-long-press` 相当、または pointer 版と event 版を分ける
- 用途: box-bot spin を「頭を長押しで回り続ける / 離すと減速停止」へ拡張、find-path（#137）の「セルを長押しで連続 push」に流用
- **依存が軽く独立して作れる。B/A の前提になる基盤なので先行**

### D. keyboard 移動の連射・加速（優先度中）

- `src/prototypes/stage/stage-06/_hooks/use-keyboard-move.ts`: keydown 毎に 1 セル。長押しでリピート・加速は `fromEvent('keydown').pipe(switchMap(() => interval(...)))` で宣言的に書ける
- 段階 3 / 4 でグリッド操作を詰めるときに検討。今回の PR 群には含めない

### E. 非同期の宣言的記述（`_stores/async-sample` / `_events/_registries` の pending Promise）（優先度低）

- 複数の非同期完了待ち・キャンセル・タイムアウトは `forkJoin` / `race` / `switchMap` / `timeout` 向き
- 現状そこまで複雑でなくオーバースペック。将来、非同期 action が増えたときに再検討

### F. 表示 / 非表示を hidden checkbox + CSS で切り替え（再レンダリング回避、非 rxjs だが同目的）

- 課題: 画面要素の表示 / 非表示を切り替えるとき、React state（`useState`）だと切替のたびに再レンダリングされる。`docs/performance/home-box-bot-interaction/README.md` の延長
- 手法（いわゆる checkbox hack を「CSS レベルの boolean state セル」として使う）:
  - 制御対象の sibling に `hidden` の `<input type="checkbox">` を置く
  - `input:checked ~ .target { ... }` で対象の表示 / 非表示（`display` / `visibility` / `opacity` 等）を CSS で定義
  - checked の切替は **ref 経由で `checkbox.current.checked = bool` を直書き**（`usePerspectiveControl` が `--floor-tilt` を、stage-06 registry が `left/top` を直書きするのと同じ発想）。React は再レンダリングしない
- rxjs との接続: 候補 B の `walkUnlocked` や候補 G の `walking` の boolean を、`setState` でなく **Observable の subscribe で `checkbox.checked` へ流す** → 解放・切替でも再レンダリング 0
- 現状 proto-01 の該当箇所:
  - `walkUnlocked`（`_hooks/use-walk-unlock.ts` → `useState` 1 回）→ 歩くボタンの `opacity` / `translate` を className で制御。checkbox 化で state 撤廃可
  - `walking`（`index.hooks.ts` の `useState`）→ ボタンラベル `歩く` ↔ `止まる` の出し分け。同上
- 論点: `hidden` 属性 + `~` 兄弟セレクタの DOM 構成（対象を checkbox の後ろに置く必要）、`display:none` にすると内部の r3f Canvas がアンマウント相当になる点（`visibility` / `opacity` を使うか要検討）、アクセシビリティ（操作用でない checkbox は `aria-hidden` / ラベルなし）
- 汎用化: `src/hooks/` に「boolean を hidden checkbox へ橋渡しする」薄い hook（`useCssBooleanCell` 相当）を切るか、proto-01 ローカルに留めるかは着手時に判断

### G. 「歩く / 止まる」の連打防止（rxjs throttle / exhaustMap、候補 D 近縁）

- 課題: `index.hooks.ts` の `toggleWalking` = `walkingToggle()`（event 発行）+ `setWalking((v) => !v)`。連打すると
  - box-bot 側 `useWalkingAction` の `toggleAction` が `walkingRef.current = !walkingRef.current` を event ごとに反転 → 姿勢ガード（`postureRef !== 0`）で一部 event が捨てられると React の `walking` state と `walkingRef` がずれる
  - 開始 / 停止の `approach`（加減速）演出が細かい toggle でガタつく
- 対応案（組み合わせ）:
  1. **event 経由へ寄せる**: 「歩く」も jump と同様 event target 経由に統一。box-bot 側に `ACTION_WALKING_START` / `ACTION_WALKING_STOP`（冪等）を足し、`ACTION_WALKING_TOGGLE` の反転をやめる。連打しても START の再送は no-op
  2. **連打を rxjs で間引く**: `click$.pipe(throttleTime(Xms))` または `exhaustMap`（遷移アニメ中のクリックを無視）。`walking$` を event / クリックから導出し、boolean を候補 F の checkbox へ流す（`setWalking` 撤廃）
  3. `walking` state を proto-01 から撤廃し、`walking$`（Observable）を単一の真実にする
- box-bot 側の変更（START / STOP 定数追加）を伴うか、proto-01 内に閉じるかで PR 規模が変わる。まず proto-01 内（throttle + F の checkbox）で閉じ、START / STOP 化は別途を推奨

## PR 分割

すべて #131 紐づけ、ブランチ `131-xxx`。

- **この PR `131-rxjs-adoption`（docs）**: 本 design.md + #137 段階 3 design.md へ候補 A のリンク追記。実装なし
- **PR: 長押し util（候補 C）** `131-rxjs-long-press-util`
  - `src/hooks/` 配下に rxjs ベースの長押し検出 util + テスト
  - EventTarget 版 / pointer 版のどちらを作るか、`@/hooks/event` との組み合わせ方は着手時に確定
  - spin への接続はこの PR では行わず、util の単体提供にとどめる（利用は後続）
- **PR: proto-01 jumpCount の Observable 化（候補 B）** `131-rxjs-proto01-jump-count`
  - `jump$ = fromEvent(eventTarget, ACTION_JUMP)` → `unlocked$` → boolean のみ state 化
  - 挙動（Observable 合成）と操作 UI を別ディレクトリへ分離（#131 積み残しの「挙動と UI の分離」）
  - C の util を使う場合はここで接続
- **PR: 表示 / 非表示の hidden checkbox + CSS 化（候補 F）** `131-css-boolean-cell`
  - proto-01 の `walkUnlocked` / `walking` の className 制御を `input:checked ~ .target` の CSS へ移す
  - boolean → `checkbox.checked` 直書きの橋渡し（ref、必要なら `src/hooks/` へ汎用 hook）
  - `display:none` と r3f Canvas の関係、`visibility` / `opacity` の選択、a11y を着手時に確定
- **PR: 「歩く / 止まる」連打防止（候補 G）** `131-walking-toggle-guard`
  - まず proto-01 内で `throttleTime` / `exhaustMap` + 候補 F の checkbox（`setWalking` 撤廃）
  - box-bot 側の `ACTION_WALKING_START` / `STOP` 化はスコープが広いため別 PR とするか判断
  - F と G は密結合（G が F の checkbox を使う）。F を先行 or 同 PR に含める
- 候補 A は #137 段階 3 PR-C 内。候補 D / E は将来

## 実装計画

- [ ] この PR: design.md 追記（本ファイル + #137 段階 3 design.md へリンク）
- [x] PR: 長押し util（候補 C） — PR #145（`_pr/pr-145-rxjs-long-press-util/`）マージ済。`src/lib/rxjs/long-press.ts` の `createLongPressStream`
- [x] PR: proto-01 jumpCount の Observable 化 + 挙動 / UI 分離（候補 B） — PR #146（`_pr/pr-146-rxjs-proto01-jump-count/`）マージ済。`_hooks/use-walk-unlock.ts` で `ACTION_JUMP` 購読 → boolean のみ state 化、proto-01 を hooks 構成へ分割
- [ ] PR: 表示 / 非表示の hidden checkbox + CSS 化（候補 F）
- [ ] PR: 「歩く / 止まる」連打防止（候補 G）

## 決定事項

- 2026-09-09: rxjs 適用のため issue #131 を reopen。元テーマの実装は完了済、rxjs 適用（積み残し 3 項目）のみを本 steering で扱う
- 2026-09-09: 適用候補を A〜E で洗い出し。着手は C（長押し util）→ B（proto-01 jumpCount）の順。A は #137 段階 3 PR-C 内、D / E は将来
- 2026-09-09: 「ジャンプ回数 vs クリック回数」は `ACTION_JUMP` 購読（`fromEvent(eventTarget, ACTION_JUMP)`）に確定
- 2026-09-09: 対応は追記（この PR）と実装（C / B の個別 PR）を分ける
- 2026-09-09: C（PR #145）/ B（PR #146）マージ済。#131 積み残しの主要 3 項目消化
- 2026-09-09: 後続課題 F（表示 / 非表示を hidden checkbox + CSS へ、再レンダリング回避）/ G（歩く・止まるの連打防止、event 経由化 + throttle）を追加。F は非 rxjs 技法だが同じ再レンダリング回避目的、G は候補 D 近縁。F → G の順（G が F の checkbox を使う）

## 懸念・リスク

- rxjs と React state の境界を都度判断する必要がある（`docs/performance/README.md` の基準に沿わせる）
- 候補 A は r3f `useFrame`（実時間）と tick（論理時間）の二層になる。段階 3 design で境界を明記
- 長押し util の配置（`src/hooks/` か `src/lib` か、EventTarget 版 / pointer 版の分割）は着手時に既存構成と照合して確定
- proto-01 は `samples/figure/box-bot` 依存。actor 版への差し替えは別軸、本 PR 群では触らない
- 候補 F: `display:none` は子孫の r3f Canvas をレイアウトから外す（レンダリング停止・再表示でリセット相当）。歩くボタン程度なら問題ないが、Canvas を含む要素へ使う場合は `visibility` / `opacity` を選ぶ
- 候補 G: box-bot 側を `ACTION_WALKING_START` / `STOP` へ変えると samples box-bot の他利用箇所（stories 等）に波及。まず proto-01 内の throttle で閉じ、定数追加は影響調査後
