# remove-unused-app-auth

`.claude/.steering/issue-96-app-top-page-readme-style/design.md` から分割。

## 目的

トップページ簡素化(ログイン導線削除)により到達不能になった bulletproof-react テンプレート由来の auth/dashboard 一式(未使用実装)を削除する。

## 背景・制約

- 調査の結果、`time-control`/`stage-04`/`box-bot` 等 本来のプロトタイプ機能から auth/features 側への依存は無し(プロトタイプ側は影響を受けない)。
- テストインフラ(`src/testing/setup-tests.ts`/`test-utils.tsx`)が MSW server・DB 初期化をグローバルに持ち、UI コンポーネントテスト(dialog/drawer/form)と共有していた。実際に必要なのは `rtlRender`/`screen`/`userEvent` の再 export のみだったため、auth/DB 依存部分を分離。

## 実装計画

- [x] `src/app/app/`(dashboard/discussions/profile/users)・`src/app/auth/`・`src/app/public/discussions/` 削除
- [x] `src/features/{auth,comments,discussions,teams,users}/` 削除
- [x] `src/lib/auth.tsx`・`src/lib/authorization.ts`(+test)・`src/lib/api-client.ts`・`src/utils/auth.ts`・`src/config/env.ts` 削除
- [x] `src/testing/mocks/`(MSW handlers/db)・`src/testing/data-generators.ts` 削除
- [x] `mock-server.ts`・`public/mockServiceWorker.js` 削除
- [x] `e2e/tests/{smoke,profile,auth.setup}.spec.ts` 削除、`playwright.config.ts` から auth setup project/storageState 配線を除去
- [x] `src/app/layout.tsx`(getUserQueryOptions 除去、metadata 更新)・`src/config/paths.ts`(home のみに縮小)・`src/types/api.ts`(BaseEntity のみに縮小) 修正
- [x] `src/testing/setup-tests.ts`/`test-utils.tsx` を auth/DB 非依存に簡素化(zustand mock・ResizeObserver stub は維持)
- [x] `package.json` から不要依存(msw, @mswjs/data, @mswjs/http-middleware, js-cookie, @types/js-cookie, express 関連, pm2, tsx, dotenv 等)・`run-mock-server`/旧 `test-e2e` script 削除、`name` を `under-construction-proto` へ
- [x] `.gitignore`(`/e2e/.auth/`・`mocked-db.json`)・`SETUP.md`(bulletproof-react clone 手順)・CLAUDE.md テスト実行節(env 必須の記述)を実態に合わせて修正

## 決定事項

- 削除範囲は auth 本体だけでなく、道連れで到達不能になる dashboard/users/discussions/comments/teams も含めて一式削除(ユーザー承認済み)。
- `src/types/api.ts` の `BaseEntity` のみ `components/ui/table` が汎用的に使用しているため残す。

## 懸念・リスク

- `.env.example`/`.env.example-e2e` はサンドボックス権限で直接編集不可(auth/mock-server 関連の記載が古いまま残る可能性)。ユーザー側での確認・修正を推奨。
