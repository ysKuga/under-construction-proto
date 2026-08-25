# app-top-page-readme-style

issue: #96

## 目的

`src/app/page.tsx`(アプリのトップページ、`src/app/` 配下)を1ページ構成にし、README.md と同じような構成(タイトル+画像のみ)にする。

## 背景・制約

- 現状 `src/app/page.tsx` は bulletproof-react テンプレート由来の汎用ホーム画面。タイトル・ロゴ・説明文・ログイン導線ボタン(`Get started`)・GitHub リンクボタンを持つ。
- README.md は本作業で `# Under Construction Proto` + box-bot 画像(`.github/assets/box-bot.png`)のみのシンプル構成に整理済み。セットアップ手順は `SETUP.md` へ切り出し済み。
- `src/app/` 配下には他に `src/app/app/`(ログイン後のダッシュボード)・`src/app/auth/`(ログイン等)がある。今回の対象はトップページ(`src/app/page.tsx`)のみで、これらのサブルートは変更しない。

## 実装計画

- [x] `src/app/page.tsx` を README と同様の1ページ構成(タイトル+画像)に変更
- [x] 既存のログイン導線(`Get started` ボタン)・GitHub リンクボタンの扱いを検討(削除するか、別の形で残すか) → 削除(決定事項参照)
- [x] 表示する画像を検討(box-bot 画像を再利用するか、専用の画像を用意するか) → `samples/figure/box-bot` の `BoxBot`(3D)を再利用(決定事項参照)

今後の追加検討(表示調整・関連 samples 整理等)は個別のサブ steering ディレクトリへ分割する。

- [x] トップページ簡素化で到達不能になった bulletproof-react 由来 auth/dashboard 一式の削除 → `.claude/.steering/issue-96-app-top-page-readme-style/_closed/pr-97-remove-unused-app-auth/` へ分割、対応完了・close 済(PR #97)

## 決定事項

### 表示コンポーネント・ログイン導線 (2026-08-24)

- 表示物は `<h1>` タイトル(README と同じ "Under Construction Proto")+ `@/components/samples/figure/box-bot` の `BoxBot`(`mode="3d"`)。専用画像は用意せず、既存 samples を再利用する。
- 旧実装(bulletproof-react 由来のログイン導線ボタン・GitHub リンクボタン・ロゴ)は削除。トップページ以外にログインへのナビゲーション経路が無い状態になるが、URL 直打ち(`/auth/login`)は引続き機能するため許容する判断。

### not-found クリック時の回転演出 (2026-08-25)

- box-bot-model に新規 action `ACTION_SPIN`(`_action-hooks/use-spin-action.ts`)追加。`spinActionRef`(進行度、jump/fall 系と同じ -1/経過秒パターン)を使い、加速(`SPIN_ACCEL_DUR`)→最大速度維持(`SPIN_MAX_SPEED`・`SPIN_CRUISE_DUR`)→減速(`SPIN_DECEL_DUR`)して停止、の台形速度プロファイルで `spinRef.rotation.y` を回転させる。`spinRef` への反映は増分加算方式(`useAutoRotateAction` と同じ)にし `autoRotate` と共存可能にした。
  - 各フェーズの継続時間は秒単位で直接指定する設計(加速度からの逆算ではない)。既定値は各フェーズ 1 秒・`SPIN_MAX_SPEED = 6π`(1秒あたり3回転)で、加速 1.5周・巡航 3周・減速 1.5周(計 6周、合計 3 秒)。各フェーズで十分な回転数が見えるようにする狙い。
- `ACTION_SPIN` は `box-bot-3d/index.tsx` → `box-bot/index.tsx` 経由で public export し、not-found から `clickActionMap={{ body: ACTION_SPIN, head: ACTION_SPIN }}` で既定の `ACTION_JUMP` を上書き。home 側は無指定のまま(挙動変化なし)。
- 遷移(`Link` → home)は制御せず並行実行(簡易案採用)。回転完了を待ってから遷移する案は実装コストが高いため見送り。

### 待機演出(bot 以外へのホバー中は連続ジャンプ) (2026-08-25)

box-bot-model 共通実装(home・not-found 両方に影響)。モバイルファースト方針のため、hover 概念が無いタッチ環境も考慮した設計にした。

- `botHoverRef` は bot 要素の `onPointerOver`/`onPointerOut`(PC hover)に加え `onPointerDown`/`onPointerUp`(モバイル touch)でも更新し、環境を問わず「bot に触れているか」を判定できるようにした

**初期実装(Canvas hover 依存、不採用)**: PC は Canvas 内(bot 以外の背景含む)へのポインタ有無(`canvasHoverRef`、`BoxBot3D` 外側 div の `onPointerEnter`/`onPointerLeave` で管理)、モバイルは常時アクティブ、という環境分岐にした。しかしページを開いた直後(マウスがまだ Canvas に乗っていない)はジャンプが始まらない不具合があり、「PC/モバイル問わず常時ジャンプ」という単純な仕様の方が意図に合うと判明 → 撤回。

**2 度目の実装(常時アクティブ、不採用)**: `canvasHoverRef`・環境分岐を廃止し、`botHoverRef`・`spinActionRef` のいずれかが真の間だけ停止・それ以外は常時アクティブにした。しかし box-bot-3d は home・not-found 以外にも汎用コンポーネントとして使われうる実装のため、「常時ジャンプ」が box-bot-model 全体の既定挙動になってしまい、意図しない場所(将来の利用箇所や box-bot 単体の Storybook 等)でもジャンプし続ける問題があった → 撤回。

**最終形**: 「hopping」を `ACTION_JUMP` とは独立した action として切り出した。

- 新規 action hook `use-hopping-action.ts`(旧 `use-continuous-jump-action.ts` を置換)。`hoppingRef`(既定 false)が true の間のみ、`jumpRef` が非アクティブになってから `HOPPING_INTERVAL`(0.5秒)待って次のジャンプを起動、を繰り返す。ジャンプの見た目自体は既存 `useJumpAction`(`jumpRef` 共有)を再利用し、トリガーのみを分離
- `hoppingRef` は `ACTION_HOPPING_START`/`ACTION_HOPPING_STOP`(`useBoxBotActionDispatcher` に `hoppingStart`/`hoppingStop` として公開)で動的に切替可能。加えて `autoWalk` と同じ理由(Canvas 外部からの event はタイミング競合リスクがある)で `hopping?: boolean` prop も用意し、マウント時に直接 `hoppingRef` へ反映する
- `botHoverRef`(bot への hover/touch)・`spinActionRef`(回転 action 実行中)のいずれかが真の間は hopping を停止、収まれば自動再開する仕様は据え置き
- home・not-found のみ `hopping` prop を指定して有効化。他の box-bot 利用箇所(Storybook 等)は既定 false のまま影響を受けない

## 検討事項

- [x] トップページの box-bot 表示完了(画面要素全表示完了)までの速度計測が未実施。本リポジトリで優先しているパフォーマンス・軽量方針との整合を確認し、表示速度向上案があれば検討する。 → `.claude/.steering/issue-96-app-top-page-readme-style/_closed/pr-98-performance-measurement/` へ分割、対応完了・close 済(PR #98)
- [ ] タイトルと box-bot の位置調整: Canvas 分の領域が確保される都合で余白の見え方に課題あり。`components/ad/molecules/assembly` 適用の効果検証・適用要否を検討する。
- [x] not-found ページの追加検討("404" 表示・接地影の調整) → `.claude/.steering/issue-96-app-top-page-readme-style/_pr/pr-99-not-found-shadow/` へ分割、対応完了(PR #99)
- [x] home への戻るクリック時に box-bot を回転させる演出 → `ACTION_SPIN` 追加で対応(決定事項参照)
- [x] not-found で確認した bot の挙動(回転・ジャンプしない)→ `interactive={false}` 明示指定が原因、削除し解消(コミット `7275480`、詳細は `_pr/pr-99-not-found-shadow/design.md` 参照)
- [ ] stories の名前に実際のパス名を反映を検討
  - not found は除外
  - `home (/)` など
