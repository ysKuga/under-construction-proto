# ADR（Architecture Decision Record）

## 導入状況

未導入、検討中。現状は steering の decision-records.md（[.claude/.steering/CLAUDE.md](../../../../.claude/.steering/CLAUDE.md) 運用ルール）へ日付箇条書きで全決定事項を記録している。

## 想定する使い分け

- 軽微な実装判断・バグ修正の経緯 → 従来どおり各 steering の `decision-records.md`（日付箇条書き）
- アーキテクチャ選択（使用ライブラリ・技術方式の確定 等）に相当する重要判断 → 個別 ADR 化を検討

## 想定フォーマット（導入時）

`docs/adr/NNNN-slug.md`。Context / Decision / Consequences の3セクション構成。

## 導入判断のタイミング

同種の重要判断が steering の decision-records.md に複数回登場し、後から参照しづらくなった時点で導入検討。
