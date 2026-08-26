# @serwist/turbopack

<https://serwist.pages.dev/docs/next/turbo>

## 概要

PWA 化(Service Worker 生成・manifest 連携)。next-pwa の後継である Serwist の Turbopack 向け実装

## バージョン注意

Next.js 16 は Turbopack がデフォルトビルダー。`@serwist/next` は webpack 前提(bundler plugin 方式)のため Turbopack 本番ビルドと非互換。本パッケージは Next.js の Route Handler 経由でビルドする方式のため Turbopack と共存できる
