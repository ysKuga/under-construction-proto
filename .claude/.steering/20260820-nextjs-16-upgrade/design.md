# Next.js 16 アップグレード

## 目的

Next.js 15.5.23 / React 18.3.1 を Next.js 16.3.1 / React 19.2 系へ安全にアップグレードする。

## 背景・制約

- Next.js 16 の App Router は React 19.2 canary を必須とする。React アップグレードが全体のトリガーになる。
- 依存ライブラリのうち `@react-three/fiber`（現行 v8 系）は React 18 向けに意図的に選定した経緯が [docs/package/3d/@react-three/fiber/README.md](../../../docs/package/3d/@react-three/fiber/README.md) にあり、React 19 移行時は v9 系（peer dep `react: ^19.0.0`）への追随が必須になる。
- Storybook（現行 8.6.18）は Next16/React19 に対応済みの 10 系まで 2 メジャー分の上げ幅が必要で、本アップグレードの中で最も作業量が大きくなる可能性がある。

## 実装計画

- [x] Storybook 8 → 10 アップグレード（`npx storybook@latest upgrade` を試験実行、差分確認）
- [x] React 18 → 19 アップグレード（別ブランチ `react-19-upgrade` で実施）
- [x] `@react-three/fiber` v8 → v9 + `@react-three/drei` 追随、box-bot-3d-01 の型修正・実機確認
- [ ] Next 15 → 16 アップグレード（`npx @next/codemod@canary upgrade latest`）
- [x] 他ライブラリ（radix-ui, react-hook-form, motion, react-spring 等）の React19 対応個別確認

## 決定事項

### Next16 単体の影響（軽微）

現行構成はほぼ無風。以下いずれも breaking change に非該当。

- webpack カスタム設定なし → Turbopack build 移行問題なし
- middleware.ts 不在 → proxy rename 対象なし
- 非同期 Request API（cookies/headers/params 等）の同期アクセス未使用
- `next lint` 未使用、`eslint .` 直叩き済み → 廃止の影響なし
- `eslint.config.cjs` で Flat Config 移行済み
- Node 22.16.0 / TypeScript 5.9.3 → 要件（Node20.9+/TS5.1+）を満たす

### @react-three/fiber v8 → v9（完了）

`@react-three/fiber@^9.7.0`、`@react-three/drei@^10.7.8` へアップグレード。対象は `src/prototypes/box-bot/3d/box-bot-3d-01` 配下のみ、他 prototype は無風。

修正内容:

- [index.types.ts](../../../src/prototypes/box-bot/3d/box-bot-3d-01/_components/box-bot-model/index.types.ts) 内 `RefObject<Group>` 型 4 箇所（leftArm/rightArm/root/spin）を `RefObject<Group | null>` に修正（React19 の `@types/react` 変更に伴う型不整合。予想通りの修正で済んだ）

**実機確認結果:** Storybook（`yarn storybook`）経由で box-bot-3d-01 の `Default` story を Playwright ヘッドレスで検証。canvas 描画確認、コンソール/ページエラーともに0件。StrictMode 継承変更による副作用も見られなかった。

### React 18 → 19（完了）

`react`/`react-dom`/`@types/react`/`@types/react-dom` を `^19.2.8`/`^19.2.18`/`^19.2.4` 系へ更新。

**破壊的変更で実際に刺さった箇所:**

- [dashboard-layout.tsx](../../../src/app/app/_components/dashboard-layout.tsx) — React19 でグローバル `JSX` 名前空間が廃止（`React.JSX` へ移動）。`JSX.Element` → `React.JSX.Element` に修正
- box-bot-3d-01 の `RefObject<Group>` 型修正（上記参照）

**他ライブラリの React19 対応:**

- `lucide-react`: `^0.378.0` → `^1.33.0`（旧バージョンの peer dep が react^18までで React19 非対応だった）
- `@testing-library/react`: `^15.0.7` → `^16.3.2`（同上）
- radix-ui, react-hook-form, motion(framer-motion), @react-spring/web, @tanstack/react-query 等は `yarn install` 時点で peer dependency warning が出なかった → 対応範囲内と判断
- `@testing-library/dom` の unmet peer warning が出るが、間接依存として `10.4.1`（要件 `^10.0.0`）が既にインストール済みで実害なし

**検証結果:** `yarn lint` / `yarn check-types` / `NEXT_PUBLIC_API_URL=http://localhost:3000 yarn test run`（30ファイル133テスト）全て通過。

### Storybook 8.6.18 → 10 系（完了）

`npx storybook@latest upgrade --yes` を実行し、Storybook 10.5.9 系へアップグレード済み。自動 codemod は複数箇所で不完全・不整合な出力をしており、手動修正が必要だった。

**自動 codemod の不備と手動修正内容:**

- [eslint.config.cjs](../../../eslint.config.cjs) — ESM `import storybook from "eslint-plugin-storybook"` が `.cjs`（CJS）ファイルの先頭に追記され構文エラー（`SyntaxError: Cannot use import statement outside a module`）。`require('eslint-plugin-storybook')` に変換し、かつ `storybook.configs['flat/recommended']` を config 配列に実際に組み込み（元の codemod は import しただけで未使用だった）
- [.storybook/main.ts](../../../.storybook/main.ts) — `storybook/internal/node-logger` という内部パスが addon として誤登録され lint エラー（`storybook/no-uninstalled-addons`）。削除
- [.storybook/main.ts](../../../.storybook/main.ts) — `@storybook/addon-mcp`（AIエージェントによる stories 自動生成・テスト補助機能）が意図せず追加されていた。Next16 アップグレードとスコープ外のため削除（ユーザー確認済み）
- framework は `@storybook/nextjs`（Webpack版）ではなく `@storybook/nextjs-vite`（Vite版）が自動選択された。ユーザー確認の上でこちらを正式採用
- 全 stories.tsx（21ファイル）の import が `@storybook/react` に一括置換されていたが、これは実行時には動くがプロジェクトの元 `moduleResolution: "node"` 設定と組み合わさると型解決不能だった。[tsconfig.json](../../../tsconfig.json) の `moduleResolution` を `"node"` → `"bundler"` に変更（`@storybook/react` の conditional exports が旧設定では解決できないため）。さらに lint ルール `storybook/no-renderer-packages`（renderer package 直接 import 禁止）に従い、最終的に全 stories.tsx の import 元を `@storybook/nextjs-vite` に統一
- package.json の `@storybook/node-logger: ^8.6.14` が更新されず取り残されていた（main.ts 参照削除に伴い依存自体も削除）

**副次的に発生した問題:**

- `npx storybook@latest upgrade` の初回実行が stdin を `/dev/null` にリダイレクトした状態で確認プロンプト待ちに入り、1時間近くフリーズ。`--yes` フラグ（プロンプト自動バイパス）を付けて再実行して解決
- upgrade が新規追加した `vite@^7.0.0`（トップレベル）と既存 `vitest@2.1.9` が内部で抱える `vite@5.4.1` の型定義が衝突し `tsc --noEmit` が2件エラー（実行には影響なし、テストは全通過していた）。`vitest` を vite7 系に対応する最小メジャーである `^3.2.7` へアップグレードして解消

**検証結果:** `yarn lint` / `yarn check-types` / `NEXT_PUBLIC_API_URL=http://localhost:3000 yarn test run`（30ファイル133テスト）全て通過。

**起動時警告の調査（`.storybook/preview.tsx` docgen skip）:**

Storybook 起動時に以下の Vite warning が出る。

```text
Skipping docgen for ".storybook/preview.tsx" because it is not included in the active TypeScript project.
```

[.storybook/preview.tsx](../../../.storybook/preview.tsx) は Storybook の設定ファイル自体（Reactコンポーネントではない）で、props docgen の対象にする必要がないファイル。Playwright で `components-ui-button--default` story の Controls panel を実際に確認し、children/asChild/icon/isLoading 等 6 件の props が正常表示されることを検証済み。docgen 自体は正常動作しており、この警告は無害（対象外ファイルが正しく除外されているだけ）。対応不要と判断。

### React 18 → 19 以降（未着手）

- `@react-three/fiber@10.5.9` の peerDependencies は `next: ^14.1.0 || ^15.0.0 || ^16.0.0`、`react: ^19.0.0` を含み Next16/React19 対応済み（Storybook側の話、fiber ではなく nextjs-vite framework の話。念のため区別して記載）
- Turbopack は Storybook 側では非対応（`@storybook/nextjs-vite` framework は内部 Vite ビルドのため、Next.js 本体の Turbopack 化とは無関係な別パイプライン）

## 懸念・リスク

- `npx storybook@latest upgrade` のような公式自動アップグレードツールでも、生成物をそのまま信用せず lint/型チェック/テストの実行結果で検証する必要がある（今回 eslint.config.cjs の構文エラー、存在しないパッケージへの import、moduleResolution起因の型解決不能など複数の不備があった）。
- `moduleResolution: "bundler"` への変更はプロジェクト全体の TypeScript 設定変更のため、他の import 解決にも影響しうる。今回の変更後 `yarn check-types` は通過済みだが、広範囲な副作用が完全に無いとは言い切れない。
- `@react-three/drei` v10 系の Line/ContactShadows/OrbitControls は box-bot-3d-01 の `Default` story で実描画確認済みだが、`Sizes`/`Static`/`Straight` 等の他 story やインタラクション（クリックでのホップ・腕の上げ下げ）までは未検証。
- Next 15 → 16 本体のアップグレードは本ブランチ（`react-19-upgrade`）未着手。別 PR で対応予定。
