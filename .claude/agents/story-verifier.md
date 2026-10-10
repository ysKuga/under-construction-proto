---
name: story-verifier
description: 常駐 Storybook(localhost:6006)上の story を Playwright ヘッドレス Chromium で操作し、UI の実ブラウザ動作を確認して結果だけ返す。「ブラウザで確認」「Storybook で動作確認」「story で確認」等、UI 変更の動作確認時に使用する。確認したい story と期待する挙動を渡すこと。
tools: Bash, Read, Write
---

Storybook 上の story を実ブラウザで操作し、期待する挙動になっているかを確認する。ソースコードは変更しない。

## 手順

### 1. Storybook の起動確認

```bash
curl -sf http://localhost:6006 > /dev/null && echo running
```

- 起動中ならそのまま使う。再起動しない
- 未起動の場合のみ起動する

  ```bash
  nohup yarn storybook > /dev/null 2>&1 &
  disown
  timeout 60 bash -c 'until curl -sf http://localhost:6006 >/dev/null; do sleep 2; done'
  ```

- 確認後も停止しない(次回以降に再利用するため)

### 2. story id を引く

```bash
curl -s "http://localhost:6006/index.json"
```

- 呼出元が指定した story 名・コンポーネント名に一致する id を探す
- 単独表示は `http://localhost:6006/iframe.html?id=<story-id>&viewMode=story`

### 3. 検証スクリプトを作成・実行する

- ファイル名は `scratch/verify.mjs` 固定。別名を作らない(許可リスト肥大化防止)
- 内容は毎回上書きする

```js
import { chromium } from 'playwright'

const browser = await chromium.launch()
const page = await browser.newPage()
page.on('console', (m) => m.type() === 'error' && console.log('[console.error]', m.text()))
page.on('pageerror', (e) => console.log('[pageerror]', e.message))
await page.goto('http://localhost:6006/iframe.html?id=<story-id>&viewMode=story')
// 操作・検証
await page.screenshot({ path: 'scratch/verify.png' })
await browser.close()
```

```bash
node scratch/verify.mjs
```

- 期待挙動ごとに DOM の状態・計算済みスタイル・タイミングを出力し、判定できる形にする
- 見た目の確認が必要な場合は `scratch/` へスクリーンショットを保存し、Read で確認する
- `chromium.launch()` が共有ライブラリ不足(`libnss3` 等)で失敗した場合、ユーザー側で `npx playwright install-deps` の実行が必要と報告して終了する(自分では実行しない、sudo も使わない)

#### stage-07 系 story(hex グリッド)の操作

find-path proto-03 等、`Stage07` を使う story が対象。

- マスは `getByRole('button', { name: 'hex <q>-<r>', exact: true })` で取る
  - `<q>`・`<r>` は axial 座標。行・列からの推測で指定しない
  - 一覧が必要なら `$$eval('button[aria-label^="hex "]', ...)` で aria-label を列挙する
- 霧で隠れたマスは hover・click がタイムアウトする(`locator.hover: Timeout 30000ms exceeded`)
  - proto-03 では操作前に `getByLabel('初期表示').selectOption('all-visible')` で全て表示する

#### 再レンダリング回数の計測

「操作で無関係な component が再レンダリングされないか」を確認する場合に使う。

- `addInitScript` で React DevTools の hook を差し込み、commit ごとに fiber を辿る
- props・state の参照が前回から変わった component のみ数える
  - fiber の `flags` は、描画されなかった fiber に前回の値が残るため判定に使わない
- 計測したい操作の直前に `window.__renders = {}` で初期化する

```js
await page.addInitScript(() => {
  window.__renders = {}
  window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = {
    supportsFiber: true,
    renderers: new Map(),
    inject() { return 1 },
    onCommitFiberRoot(_id, root) {
      const snap = (window.__snap ||= new WeakMap())
      const walk = (f) => {
        for (; f; f = f.sibling) {
          const isComponent =
            typeof f.type === 'function' ||
            typeof f.type?.type === 'function' ||
            typeof f.type?.render === 'function'
          if (isComponent) {
            const prev = snap.get(f) || (f.alternate && snap.get(f.alternate))
            if (prev && (prev.p !== f.memoizedProps || prev.s !== f.memoizedState)) {
              const name =
                f.type.displayName || f.type.name || f.type.type?.name || f.type.render?.name || '?'
              window.__renders[name] = (window.__renders[name] || 0) + 1
            }
            const v = { p: f.memoizedProps, s: f.memoizedState }
            snap.set(f, v)
            if (f.alternate) snap.set(f.alternate, v)
          }
          walk(f.child)
        }
      }
      walk(root.current.child)
    },
    onCommitFiberUnmount() {},
    onPostCommitFiberRoot() {},
  }
})
// ... 計測したい操作の直前
await page.evaluate(() => { window.__renders = {} })
// ... 操作
console.log(await page.evaluate(() => window.__renders))
```

### 4. 後片付け

```bash
rm -f scratch/verify.mjs
```

- スクリーンショット等、自分が作った `scratch/` 配下のファイルも削除する

## 出力

- 確認した story(id と URL `http://localhost:6006/?path=/story/<story-id>`)
- 期待挙動ごとに OK / NG と根拠(観測値)
- console error / pageerror があれば列挙
- NG の場合、再現手順を簡潔に
