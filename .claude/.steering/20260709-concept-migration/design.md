# concept-migration

## 目的

`ysKuga/under-construction` リポジトリの issue (#1〜#4) に記述されたアイディア・コンセプトを `under-construction-proto` 側に移行し、当リポジトリの構成・実装(特に prototypes/stage)と併せてコンセプトを決めていく。

## 背景・制約

- `under-construction` リポジトリは概念・アイディア置き場として使われており、issue #1(構成について)、#2(概念について)、#3(関心について)、#4(あいであなど)の4件がOPENで存在する。
- `under-construction-proto` 側の `docs/terminology/` は確定した用語を扱う場所であり、検討中のアイディアとは性質が異なる。
- 現在 `35-prototypes-stage-04` ブランチで stage 実装作業中。issue #35(prototypes/stage)の残タスクは「layer の串刺し(aspect?) について context を使用した実装」。

## 実装計画

- [x] `docs/concept/` を新設し、4 issue の内容をそのまま移行
  - [x] `docs/concept/README.md` ← #2 概念について
  - [x] `docs/concept/structure/README.md` ← #1 構成について
  - [x] `docs/concept/flow/README.md` ← #3 関心について
  - [x] `docs/concept/ideas/README.md` ← #4 あいであなど
- [ ] 内容が固まった項目から `docs/terminology/` 側へ随時昇格
- [ ] stage/actor 実装(position, figure 等)と `docs/concept/README.md` の「位置」「姿勢」項目を対応付け
- [ ] stage-04 の残タスク(layer 串刺し/aspect)とコンセプトの関連整理

## 決定事項

- `docs/concept/` と `docs/terminology/` は役割分離: concept = 検討中、terminology = 確定済み。
- 4 issue の文面は書き換えず、ほぼそのまま移行(常体で統一のみ)。

## 懸念・リスク

- `docs/concept/structure/README.md`(monorepo化案)は現行の `src/` 単一パッケージ構成と食い違う。実現するかどうか未決定。
- `under-construction` リポジトリ側の issue は移行後もOPENのまま残っている。クローズするかどうか未決定。
