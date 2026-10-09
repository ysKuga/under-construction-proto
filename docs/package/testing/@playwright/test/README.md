# @playwright/test

<https://playwright.dev/>

## 概要

ブラウザ自動操作によるテストフレームワーク。

- `npm run test-e2e` で E2E テストを実行する。
- Storybook 上の story を headless Chromium で操作する実ブラウザ動作確認にも使う([CLAUDE.md](../../../../../CLAUDE.md) の「実ブラウザ動作確認」参照)。

## ブラウザの導入

npm パッケージとは別に、以下2つを端末ごとに導入する必要がある。

- Chromium 本体
  - 導入先: `~/.cache/ms-playwright`
  - package.json の依存としては管理できない
- OS の共有ライブラリ(`libnss3`/`libnspr4`/`libasound2` 等)
  - apt で導入するため sudo が必要

両方まとめて以下で導入する。

```sh
make playwright-install
# または
npm run playwright-install
```

- 中身は `playwright install --with-deps chromium`。
- apt 実行時に sudo のパスワードを求められるため、ユーザー自身が実行する。
- `sudo npx ...` は不可(npx が現在ユーザー環境に導入されており sudo の PATH に無い)。npx 自体は非 sudo で起動し、apt 導入が必要な箇所のみ内部で権限昇格される。

### `prepare`/`postinstall` に組み込まない理由

- `npm install` のたびに約 115MB のダウンロードが走る(CI・Chromatic 含む)。
- sudo を求められて処理が止まる。

### 導入漏れの症状

- `Executable doesn't exist at ~/.cache/ms-playwright/...` → Chromium 本体が未導入。
- `error while loading shared libraries: libnspr4.so` 等 → OS ライブラリが未導入。
- `make playwright-install` が `E: dpkg was interrupted, you must manually run 'sudo dpkg --configure -a'` で失敗 → 過去の apt/dpkg 処理が中断されたまま(WSL 終了時等)。
  - `sudo dpkg --configure -a` で一度復旧してから再実行する。
  - 復旧操作のため `playwright-install` 自体には含めない。

## バージョン注意

playwright を更新するとブラウザのリビジョン(`chromium_headless_shell-<番号>`)も変わるため、更新後は `make playwright-install` を再実行する。
