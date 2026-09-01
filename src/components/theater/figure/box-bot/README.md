# components/theater/figure/box-bot/

手描き風ボックスロボット (box-bot) の figure 実装を格納する。

- 経緯: #71 (prototypes/box-bot、2D SVG) → #86 (box-bot samples へ昇格) → #107 (samples の 3D 実装を prototypes へコピー、box-bot-01) → #108 (表示領域限定を実装、prototypes から theater/figure へ移設)。
- `components/samples/figure/box-bot` はデモ用の見本実装として別に残る。

## バリアント

- [box-bot-01/](box-bot-01/README.md) — 表示領域を設置領域に一致させた版。ゲーム内使用向け。

## アクション範囲 (表示領域) の限定

課題: canvas を使う場合、表示は canvas の矩形に限定され、これを逸脱するアクション (fall の完全転倒など) は見切れる。

- 他要素との組み合わせのための領域を `設置領域`、アクションのために設置領域を逸脱させた領域を `表示領域` とする。
- 複数 canvas を並べる構成を想定すると、設置領域を表示領域が逸脱する前提は破綻する。原則として拡大縮小の禁止・設置領域を逸脱するアクションの禁止を置く。
- box-bot-01 の方針 (Jira UC-10): 表示領域の中心で姿勢 (回転) のみ動かし、転倒の移動ぶんは表示領域 DOM を設置領域に対してシフトさせる (jump の縦移動と同じ方式)。
- 検討詳細は `.claude/.steering/issue-108-box-bot-display-area-limit/design.md` (#108) 参照。
