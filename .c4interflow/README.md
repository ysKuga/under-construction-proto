# C4InterFlow

[C4InterFlow](https://app.c4interflow.com/docs) を使ったアーキテクチャモデリングの置き場。

## C4InterFlow とは

アーキテクチャをコード(YAML/C#/JSON)で記述し、C4 モデルの図やドキュメントを生成するツール。

- SaaS 版(app.c4interflow.com): ブラウザ UI でモデルを作成、YAML エクスポート可
- OSS 版([GitHub](https://github.com/SlavaVedernikov/C4InterFlow)): CLI(.NET)で YAML を直接記述し、`draw-diagrams` 等のコマンドで図を生成

このリポジトリでは YAML を手書きし、図生成は各自ローカルの CLI(.NET 前提)で行う想定。

## 構成

`src/app/` の構造(ページごとにディレクトリ)に合わせ、`app/` 配下へページ単位でファイルを置く。

```text
.c4interflow/
  README.md
  app/
    find-path/
      proto-03.yaml   # find-path proto-03(hex 版)のアーキテクチャモデル
```

## YAML の階層

```text
Namespace
  SoftwareSystems
    <System>
      Containers
        <Container>
          Components
            <Component>
              Interfaces
                <Interface>
                  Flows:
                    - Type: Use
                      Expression: <参照先 Interface のパス>
```

## 対象

現時点では [find-path proto-03](../src/components/pages/find-path/_prototypes/proto-03/index.tsx) のみをモデリング対象とする([find-path proto-03 優先](../.claude/.steering/issue-137-top-page-transition-target/design.md) 方針に合わせる)。
