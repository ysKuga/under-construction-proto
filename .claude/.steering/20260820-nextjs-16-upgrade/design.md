# Next.js 16 アップグレード

## 目的

Next.js 15.5.23 / React 18.3.1 を Next.js 16.3.1 / React 19.2 系へ安全にアップグレードする。

## 背景・制約

- Next.js 16 の App Router は React 19.2 canary を必須とする。React アップグレードが全体のトリガーになる。
- 依存ライブラリのうち `@react-three/fiber`（現行 v8 系）は React 18 向けに意図的に選定した経緯が [docs/package/3d/@react-three/fiber/README.md](../../../docs/package/3d/@react-three/fiber/README.md) にあり、React 19 移行時は v9 系（peer dep `react: ^19.0.0`）への追随が必須になる。
- Storybook（現行 8.6.18）は Next16/React19 に対応済みの 10 系まで 2 メジャー分の上げ幅が必要で、本アップグレードの中で最も作業量が大きくなる可能性がある。

## 実装計画

- [x] Storybook 8 → 10 アップグレード（`npx storybook@latest upgrade` を試験実行、差分確認）
- [ ] React 18 → 19 アップグレード
- [ ] `@react-three/fiber` v8 → v9 + `@react-three/drei` 追随、box-bot-3d-01 の型修正・実機確認
- [ ] Next 15 → 16 アップグレード（`npx @next/codemod@canary upgrade latest`）
- [ ] 他ライブラリ（radix-ui, react-hook-form, motion, react-spring 等）の React19 対応個別確認

## 決定事項

### Next16 単体の影響（軽微）

現行構成はほぼ無風。以下いずれも breaking change に非該当。

- webpack カスタム設定なし → Turbopack build 移行問題なし
- middleware.ts 不在 → proxy rename 対象なし
- 非同期 Request API（cookies/headers/params 等）の同期アクセス未使用
- `next lint` 未使用、`eslint .` 直叩き済み → 廃止の影響なし
- `eslint.config.cjs` で Flat Config 移行済み
- Node 22.16.0 / TypeScript 5.9.3 → 要件（Node20.9+/TS5.1+）を満たす

### @react-three/fiber v8 → v9（影響範囲小さい）

対象は `src/prototypes/box-bot/3d/box-bot-3d-01` 配下 5 ファイルのみ、他 prototype は無風。

- `index.tsx`
- `_components/box-bot-model/index.tsx`
- `_components/box-bot-model/index.hooks.ts`
- `_components/box-bot-model/index.types.ts`
- `_components/box-bot-model/_components/sketch-box/index.tsx`

修正内容:

- `index.types.ts` 内 `RefObject<Group>` 型 4 箇所（leftArm/rightArm/root/spin）を `RefObject<Group | null>` に修正（React19 の `@types/react` 変更に伴う型不整合）
- StrictMode 継承の仕様変更あり（v9 は Canvas 内で親 StrictMode を継承）→ `next.config.ts` の `reactStrictMode: true` と合わせて実機確認要
- box-bot-3d-01 は `index.stories.tsx` を持つため、Storybook 経由の描画確認も必要

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

### React 18 → 19 以降（未着手）

- `@react-three/fiber@10.5.9` の peerDependencies は `next: ^14.1.0 || ^15.0.0 || ^16.0.0`、`react: ^19.0.0` を含み Next16/React19 対応済み（Storybook側の話、fiber ではなく nextjs-vite framework の話。念のため区別して記載）
- Turbopack は Storybook 側では非対応（`@storybook/nextjs-vite` framework は内部 Vite ビルドのため、Next.js 本体の Turbopack 化とは無関係な別パイプライン）

## 懸念・リスク

- 他ライブラリ（radix-ui, react-hook-form, motion, react-spring 等）の React19 対応は個別未検証。
- `@react-three/drei` v9 系との API 互換性（Line, ContactShadows, OrbitControls）は changelog 未確認。npm install 後の型チェック＋実機描画で検出する想定。
- `npx storybook@latest upgrade` のような公式自動アップグレードツールでも、生成物をそのまま信用せず lint/型チェック/テストの実行結果で検証する必要がある（今回 eslint.config.cjs の構文エラー、存在しないパッケージへの import、moduleResolution起因の型解決不能など複数の不備があった）。
- `moduleResolution: "bundler"` への変更はプロジェクト全体の TypeScript 設定変更のため、他の import 解決にも影響しうる。今回の変更後 `yarn check-types` は通過済みだが、広範囲な副作用が完全に無いとは言い切れない。
