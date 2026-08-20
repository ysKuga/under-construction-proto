# next-upgrade

## 目的

Next.js 14→15 アップグレード実施(本ブランチ完了分)。加え oxlint 導入検討・Next.js 16 移行検討 記録。

## 背景・制約

- Next.js 最新16系だがReact19必須、影響範囲大。ユーザー方針: 15先行、16は別PR
- 今回更新範囲: Next関連 + 同メジャー帯内安全更新のみ(ユーザー選択)。zod4/zustand5/tailwindcss4/express5/typescript-eslint8等 次メジャーは対象外
- リポジトリはyarn管理。npm installで一度yarn.lock/package-lock.json汚染発生、復旧済み(以後npm outdated調査用途のみ許容、install/lockfile更新はyarn使用)
- Node.jsは22(Jod)が2025-10 Maintenance LTS入り済み、24(Krypton)が2025-10 Active LTS入り済み(EOL 2028-04)。次期LTSとして24採用

## 実装計画

- [x] Next.js 14.2.5→15.5.23 アップグレード(react/react-dom 18.3.1維持)
- [x] cookies()/params/searchParams 非同期API化対応(src/lib/api-client.ts, src/utils/auth.ts, src/app/page.tsx, src/app/app/discussions/page.tsx, src/app/public/discussions/[discussionId]/page.tsx)
- [x] eslint-plugin-react-hooks 4.6.2→5.2.0(eslint-config-next15内部要求版との衝突解消)
- [x] @types/express 追加(mock-server.ts既存型エラー解消、docs/package/testing/配下にdocs追加)
- [x] build/lint/test/check-types 全緑確認
- [x] Node.js 24系(Krypton, Active LTS)へアップグレード(別ブランチ node-24-upgrade、next-15-upgrade派生)。.nvmrc 22→24、@types/node 20→24、nvm install 24でローカル環境にも追加
- [ ] oxlint 導入検討
- [ ] Next.js 16 移行検討(React19必須)

## 決定事項

- eslint-import-resolver-typescriptは3.6.1据置(3.10.1がtypescript-eslint8系要求し既存7.18.0と衝突するため)
- @testing-library/jest-dom は 6.9.1 に固定(`^`指定だと6.10.0が入り、Node22+/@testing-library/dom peer必須のbreaking変更を踏む)

## 懸念・リスク

- `next lint` はNext16で廃止予定。16移行時 ESLint CLI直接実行への切替要る(oxlint導入検討ともタイミング重なる可能性)
- `npm audit` で46件脆弱性検出(storybook系間接依存中心と推測)。未調査
- oxlint導入時、`.eslintrc.cjs`の`import/no-restricted-paths`(feature間依存制御)・`check-file`(命名規約)等 oxlint未対応/対応状況要確認のルールあり。移行は段階的併用 or 全面置換か要検討
