# 移動・コピー後の旧パス参照

ディレクトリ・ファイルの移動・コピー後、コミット前に旧パス文字列をリポジトリ全体から grep し、残る参照を全て付け替える。

```bash
git grep -n "find-path/_prototypes"
```

- 検索範囲、ディレクトリ・拡張子で絞らない
  - 見落としやすい参照先
    - `src/components/pages/README.md`
    - `.c4interflow/`(README のリンク・`app/**/*.yaml` のコメント)
    - `docs/`・`CLAUDE.md`・`.claude/rules/` のリンク
- 対象外: `_closed/` 配下の steering(作業時点の記録のため)
- 実装名・呼称(`find-path proto-03` 等)のみの言及、パスでなければ対象外
- import の付替え、`replace-in-files.py` の glob・正規表現置換で行う([CLAUDE.md](../../CLAUDE.md)「複数ファイルの一括置換」)
- 集約 index への追加漏れ、[aggregation-index.md](aggregation-index.md) 参照

## 理由

find-path の `_prototypes` を expedition 配下へ移動した際(PR #367)、grep を `docs`・`src` 等の一部ディレクトリ・拡張子に絞り、`pages/README.md`・`.c4interflow/` の旧パスが残った。PR 作成時の rules-reviewer で検出、追加コミットを要した。#357 では PR #365 の集約 index に続き、移動・コピーの後追い修正 2 回目。
