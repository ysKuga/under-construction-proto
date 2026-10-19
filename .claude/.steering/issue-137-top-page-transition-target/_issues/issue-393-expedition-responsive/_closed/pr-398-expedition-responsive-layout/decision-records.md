# 決定事項（expedition の並べ方を狭い画面向けに切り替える）

- 2026-10-19: 親 backlog の「狭い画面向けに並べ方を切り替える」を本 PR で対応する
  - 表示領域（はみ出し）は別 PR
- 2026-10-19: `md` 未満は `StageSection` の幅を画面幅（`w-full`）にした
  - 理由: `w-min` では 2 列にまたがるステージが grid の幅に効かず、マスの情報が 40px まで縮んだ
  - ステージは `justify-self-center` で横中央
- 2026-10-19: ページの外枠へ左右 16px の余白（`px-4`）を足した
  - 実アプリの `PagesLayout` は余白を持たない
  - story 上は Storybook の `padded` の余白と重なり 32px になる（許容）
