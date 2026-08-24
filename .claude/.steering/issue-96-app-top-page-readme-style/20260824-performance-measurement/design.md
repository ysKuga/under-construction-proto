# performance-measurement

親: issue-96-app-top-page-readme-style

## 目的

トップページ(box-bot 3D表示)の表示速度計測。親 design.md 検討事項「box-bot 表示完了までの速度計測が未実施」への対応。

計測結果を踏まえ、ページ作成時にパフォーマンス計測を行うルール化の要否・粒度を検討する。

## 背景・制約

- 計測は dev server(`localhost:3000`)上の Lighthouse 単発実行(`.claude/.steering/issue-96-app-top-page-readme-style/lighthouse.json`)。本番ビルドでの再計測は未実施。
- dev server 計測の Lighthouse は本番より悪化した数値が出る(next-devtools chunk 混入・unminified 等)、参考値どまり。
- r3f/three.js 主体のページ → Lighthouse の FCP/LCP/TTI 等は「初期ロード」指標のみで、Canvas 描画継続時のフレームタイムは測れない。

## 実装計画

- [x] dev server 上で Lighthouse 計測実施、結果を lighthouse.json へ保存
- [x] 本番ビルド(`next build && next start`)で再計測、実数値確認 → lighthouse-prod.json
- [ ] 改善アクション(下記、順に着手)
  1. [x] r3f/three.js の遅延読込(dynamic import)導入検証 → **不採用**(下記「検証結果」参照)
  2. [x] `<main>` ランドマーク要否再確認 → **採用**(下記「検証結果」参照)
  3. [x] r3f canvas 実フレームレート計測(`r3f-perf`)導入 → 恒久設置(下記「検証結果」参照)
  4. [x] legacy-javascript / render-blocking-resources 対応 → **見送り**(下記「検証結果」参照)
- [ ] ルール化の要否・粒度を検討(保留中、下記「検討事項」参照)
- [ ] 検討結果を `.claude/rules/` へ反映(採用する場合)

## 決定事項

### Lighthouse 計測結果 (2026-08-24, dev server)

- Performance: 67 / Accessibility: 98 / Best Practices: 100 / SEO: 100
- FCP 1.2s, LCP 1.3s, CLS 0 → 初期描画自体は良好
- TTI 11.9s, TBT 2,500ms, mainthread-work-breakdown 8.9s, bootup-time 6.5s → interactivity 系が悪い
- bootup-time 内訳: `@react-three/fiber` chunk が突出(total 3,088ms, scripting 2,760ms)
- unused-javascript: r3f chunk 92KiB 無駄、three.js core/module 系も無駄多め
- landmark-one-main: score 0(`<main>` ランドマーク未使用)

### Lighthouse 計測結果 (2026-08-24, 本番ビルド: `next build && next start` port 3001, headless chromium)

- Performance: 70 / Accessibility: 100 / Best Practices: 100 / SEO: 100
- FCP 0.8s, LCP 1.2s, CLS 0, Speed Index 1.3s → 初期描画は高速、信頼できる数値
- landmark-one-main 問題は本番では未検出(dev固有の差分だった可能性、要再確認)

**重大な計測アーティファクト**: TBT 156,600ms、TTI 181.2s、mainthread-work-breakdown 179.6s(内訳 `other` だけで174s)。runWarnings に \
  `"The page loaded too slowly to finish within the time limit. Results may be incomplete."` \
  明記あり。

原因特定: `useFrame` の常時 requestAnimationFrame ループにより、ページが Lighthouse の「静止(quiescent)」判定に到達しない → ロード完了判定がタイムアウトまで引っ張られ、TTI/TBT/mainthread-work-breakdown が無意味な数値になる。

**結論**: Lighthouse の FCP/LCP/CLS/Speed Index は信頼できる。TTI/TBT/mainthread-work-breakdown 等の interactivity 系指標は、r3f 常時アニメーション canvas を含むページでは構造的に信用できない(measured value ではなく measurement failure)。

### 検証結果: r3f/three.js 遅延読込(dynamic import) — 不採用(効果なし) (2026-08-24)

`src/components/samples/figure/box-bot/index.tsx` で `BoxBot3D` を `next/dynamic(..., { ssr: false })` 化、本番ビルド(`next build && next start` port 3001)で計測。

初回2回計測(SI 2.9s/3.1s)で「悪化」と誤判定した。原因は Chrome の user-data-dir パス解決不良(下記「計測環境の不具合」参照)による毎回異なる実行条件 → 比較対象(静的 import 版)を同条件で計測していなかった。user-data-dir 固定後、両方を3回ずつ計測し直した結果:

| 指標 | 静的import(現行, 3回) | dynamic import(3回) |
| --- | --- | --- |
| Performance score | 69 / 69 / 70 | 67 / 69 / 69 |
| Speed Index | 2.7s / 2.9s / 3.2s | 3.1s / 3.1s / 3.2s |
| unused-javascript | 168KiB(3回とも) | 163KiB(3回とも) |

Performance score・Speed Index とも両者のブレ幅が重なり有意差なし。unused-javascript の差(168→163KiB, 3%)も誤差レベル。**dynamic import 導入による効果は確認できず**(悪化でも改善でもない)。

**原因**: `BoxBot3D` はページの主要 visual content(above-the-fold)。遅延 import で削減できるのは「初回バンドルへの同梱タイミング」であって「不要コード」ではない → クライアント初期化後すぐに読み込まれるため bundle 分割の恩恵が出ない。unused-javascript の正体は r3f/three.js 内部の未使用モジュール(tree-shaking課題)であり、import timing の問題ではなかった。

**結論**: revert 済み(`git checkout` で静的 import に戻した)。効果ゼロの施策に `'use client'` + `dynamic()` の複雑性を追加する理由なし(YAGNI)。r3f/three.js の bundle size 改善は tree-shaking / import 対象の絞り込み等 別アプローチを要する。

**傍証**: ユーザー手作業による dev server(`localhost:3000`)計測でも同じ結論。静的import(revert後)で Performance 79 / 79(`0-lighthouse.json`, `1-lighthouse.json`)、dynamic import版で 83 — ブレ幅の範囲内で有意差なし。dev server計測につき runWarnings に IndexedDB干渉の注意あり、参考値扱い。

**追加の切り分け実験**: box-bot 自体を設置しない状態(dev server)で計測すると Performance 93(`00-lighthouse-no-bot.json`)。box-bot あり(79)との差14ポイントは import timing でなく box-bot(r3f canvas 常時アニメーション)自体の存在が支配的要因であることを示す。改善アクション3「r3f canvas 実フレームレート計測」で掘る。

### 検証結果: `<main>` ランドマーク追加 — 採用 (2026-08-24)

`src/app/layout.tsx` で `<AppProvider>{children}</AppProvider>` を `<AppProvider><main>{children}</main></AppProvider>` に変更。`Notifications`/`ReactQueryDevtools` はページ本体コンテンツでないため `AppProvider` 内部(main の外)のまま。

実データ確認: `landmark-one-main` audit の `scoreDisplayMode` は `informative`(score 自体は常に1、pass/fail判定に不使用)。実際の failing element 有無で判定要 → 変更前は `items` に「Document does not have a main landmark」が1件検出、変更後は0件(`scratch/lighthouse-main-landmark.json`)。design.md 冒頭に記載した「本番では未検出」は誤読(informative score=1 を pass と誤認していた)、dev固有差分ではなかった。

本番ビルドで再計測: Performance 70 / Accessibility 100(変更前後とも同値、想定通り Performance には影響しない)。

**結論**: 採用。`<html>` に反映確認・DOM出力(`curl` で `<main>` 存在確認)・型チェック・本番ビルド 全て通過。

### 検証結果: r3f canvas 実フレームレート計測(r3f-perf) — 恒久設置 (2026-08-24)

`r3f-perf` を導入(`yarn add r3f-perf`、[docs/package/3d/r3f-perf/](../../../../docs/package/3d/r3f-perf/README.md) 参照)。

**設置方式の変更**: 当初 `box-bot-3d/index.tsx` の Canvas 内に直接 `<Perf />` を配置したが、本体コンポーネントが r3f-perf(検証用ツール)に依存するのは責務混在のため差し戻し。代わりに `BoxBot3DProps`/`BoxBot`(親)に `PropsWithChildren` で `children` slot を追加、Canvas 内末尾で `{children}` を render するのみに変更(本体は r3f-perf を一切 import しない)。Storybook の `Mode3D` story(`index.stories.tsx`)側で `render: (args) => <StoryComponent {...args}>{process.env.NODE_ENV === 'development' && <Perf position="top-left" />}</StoryComponent>` として注入。

**複数設置の考慮**: `Sizes`/`Grid3D`/`OverlapGrid3D`/`Circle` 等、複数 `BoxBot3D`(= 複数 Canvas)を同時 render する story が既に多数存在する。r3f-perf の `Perf` は内部でグローバルな計測をしている可能性があり、複数 Canvas に同時設置すると干渉・UI重複の懸念があるため、Perf 注入は単体表示の `Mode3D` story のみに限定。他 story は children を渡さず、デフォルトで何も表示されない(children slot 方式のため安全)。Playwright headless chromium で `Mode3D`(Perf 表示)・`Sizes`(3体同時表示、Perf 非表示)両方のスクリーンショットを確認、意図通りの挙動を確認済み。

既存 `provider.tsx:27` の `{process.env.DEV && <ReactQueryDevtools />}` は `process.env.DEV` が未定義変数(常に `undefined`)のため実質死んでいるコードだった。今回追加分は同じ轍を踏まず `process.env.NODE_ENV === 'development'` で実装(provider.tsx 側の既存バグ修正は本タスクのスコープ外、別途対応要)。

Storybook(`components-samples-figure-box-bot--mode-3-d`)+ Playwright headless chromium で表示・動作確認: FPS 12 / CPU 3.7ms / GPU 0.000ms / calls 191 / Triangles 5170。**GPU 計測が 0.000ms 固定 → headless環境の GPU タイミングクエリ未対応の疑いが強く、FPS 12 という数値はこの計測環境の信頼性に疑問あり**。実ブラウザでの体感カクつき確認は別途ユーザー環境で実施要。今回のスコープは Perf UI の恒久設置・動作確認までとし、実測値の評価は持ち越し。

### 検証結果: legacy-javascript / render-blocking-resources 対応 — 見送り (2026-08-24)

**legacy-javascript(13KiB)**: 該当 chunk(`36l_2xs6cbv7i.js`)の内容確認 → `trimStart`/`Array.prototype.flat`/`flatMap`/`Promise.prototype.finally`/`Object.fromEntries`/`Array.prototype.at`/`Object.hasOwn`/`URL.canParse` の feature-detection polyfill。これは **Next.js 組み込みの `@next/polyfill-module`**(公式パッケージの中身と一致)で、`browserslist` 設定に関係なく Next.js が常時・固定で注入する fail-safe 用コード。

`package.json` に `browserslist: ["> 0.5%", "last 2 versions", "not dead", "not IE 11"]` を追加して本番ビルド・計測したが、legacy-javascript 13KiB → 13KiB で変化なし(想定通り、原因が browserslist 制御外のため)。render-blocking-resources は 150ms→140ms(誤差の範囲)。**効果なしのため browserslist 設定は削除、package.json は元通り**。

**結論**: 見送り。この 13KiB は Next.js の設計判断であり、プロジェクト側の設定で削減する現実的な手段が見当たらない。render-blocking-resources(CSS 217ms)も Next.js App Router 標準動作の範囲内で、対応には critical CSS 抽出ツール等の追加導入が必要 → 効果(140ms)に対してコストが見合わないため見送り。

### 検証結果: ContactShadows `frames={1}` — 不採用 (2026-08-24)

box-bot 有無で Performance score が 14 ポイント差(79 vs 93、上記「追加の切り分け実験」参照)出ていた件を受け、描画コスト側の削減を検討。drei `ContactShadows` はデフォルト毎フレーム影を再計算する仕様のため、`frames={1}`(初回のみ計算して以降固定)を試した。

Storybook + Playwright headless chromium で `Fall`/`Walking` story の見た目を確認: **`Fall` story で明確に破綻**(倒れて横向きになった後も、影は直立時の位置・形状のまま固定され、体の下に影が全く追従しない)。`Walking` は脚の振れのみで水平移動を伴わないため目立たなかったが、`Fall`/`getUp` アクションが存在する以上採用できない。

**結論**: 不採用、revert 済み。静的シーン前提の最適化なので、fall で姿勢が大きく変わる box-bot には適用不可。

### 検証結果: shadow map 解像度削減(1024→512) — 採用 (2026-08-24)

`DIRECTIONAL_LIGHT_SHADOW_MAP_SIZE` を `[1024, 1024]` → `[512, 512]` に変更。

Storybook `Static` story(静止、比較しやすい)のスクリーンショットで見た目を確認 → 差はほぼ見分けつかない。box-bot はシンプルな箱型形状で自己影がほぼ発生しない構造のため、解像度を下げても品質劣化が目立たない。

r3f-perf(`Mode3D` story)で計測: 512版 CPU 3.050ms(1024版は 3.7ms)、FPS 12(変化なし)、Triangles/calls は同一(当然、ジオメトリ数と無関係)。GPU は headless 環境の制約で両方とも 0.000ms 固定のため比較不能。CPU の差は単発計測でノイズの可能性もあり、確度は高くない。

**結論**: 採用。見た目に差がなく副作用もない一般的な GPU 負荷削減策のため、数値的な効果を確定できないリスクを承知の上で採用。

### 計測環境の不具合: Chrome user-data-dir パス解決不良

`CHROME_PATH` に Playwright 同梱 chromium を指定して Lighthouse 実行時、Chrome の user-data-dir パス解決が壊れ、リポジトリ直下に `\\wsl.localhost\Ubuntu\...\undefined:\Users\undefined\AppData\Local\lighthouse.xxx` 形式の不正ディレクトリが毎回生成された(WSL環境で Windows 側パス解決ロジックが混入したとみられる)。git 管理下に混入 → 都度検知・削除が必要だった。

**対策**: `--chrome-flags` に `--user-data-dir=$(pwd)/scratch/chrome-profile` を明示指定することで解消。今後 Lighthouse を CLI 実行する際は必須。

**副次的な教訓**: 対策前は同一ビルドへの計測でも実行毎に大きくブレていた(例: revert 後の同一ビルドへの単発計測で Performance 99 / SI 0.8s という外れ値が出た)。user-data-dir 固定後は 67〜70 のブレ幅に収まった。単発計測での比較(design.md 冒頭の「Lighthouse 計測結果」2件も単発)は信頼性に欠ける可能性がある — 比較を伴う計測は必ず user-data-dir 固定 + 複数回実施を徹底する。

## 検討事項

- [ ] ページ作成時に毎回パフォーマンス計測を課すルールの是非
  - 確定: dev server 計測は数値が信用できない → ルール化するなら本番ビルド前提
  - 確定: Lighthouse の TTI/TBT/mainthread-work-breakdown は r3f 常時アニメーションページで構造的に無効。ルールで見るべき指標は FCP/LCP/CLS/Speed Index + Performance カテゴリスコアの推移に限定する
  - 懸念: 「ページ作成時」の粒度が広すぎる可能性(小コンポーネント追加のたびに走らせるのは過剰)。対象を「新規 route 追加時」等に絞るか検討
  - 懸念: ルールを文書化するだけでは形骸化しやすい。CI 組込み(Lighthouse CI 等)の要否は別途検討、まずは手動計測ルールから始めるか
  - 懸念: r3f canvas の実体験(フレームレート)を計測するには Lighthouse 単体で不十分、Chrome Performance panel 実測 or `r3f-perf` 併用が必要
- [x] r3f chunk の遅延読込(dynamic import)によるバンドルサイズ改善の検討 → 不採用(上記「検証結果」参照)
- [x] `<main>` ランドマーク追加 → 対応済み(上記「検証結果」参照)

## 懸念・リスク

- 計測方法(dev/prod、単発/複数回中央値)を固定しないと、今後の計測結果が比較不能になる。ルール化する場合は計測手順自体もあわせて明文化要。
