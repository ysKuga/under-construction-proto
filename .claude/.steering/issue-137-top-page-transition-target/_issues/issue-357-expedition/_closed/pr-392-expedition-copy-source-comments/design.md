# expedition のコメントに残るコピー元の言及を見直す

PR: #392（親: #357）

## 目的

expedition のコメントに残る、コピー元を自身として指す言及・古いパスを、今の expedition に合わせて直す。\
見た目・挙動は変えない。

## 背景・制約

- 親 backlog の項目「コピーした依存先に残るコピー元の名前を見直す」の後半
  - [../../backlog.md](../../backlog.md)
  - 前半（識別子 `Stage07` → `HexStage`）は PR #390 で改名済み
- 範囲: `expedition` 配下（`_prototypes` 除く）
  - backlog の hex-stage・energy に加え、同じ種類の言及がある他の置き場も含める
- 直すもの
  - 呼び出し側の例・固有の概念として書かれた「find-path proto-03」「find-path 固有」→ expedition
  - 古いパス・置き場（`stage-07/_lib/hex-path`・`_prototypes/_components/` 等）
  - 現在の挙動を「proto-03 は〜」と説明している箇所
- 残すもの
  - 試作との比較（「proto-01 と同型」「stage-06 と同じ方式」等）
  - issue の経緯（`issue-181-en backlog` 等）

## 懸念・リスク

- なし
