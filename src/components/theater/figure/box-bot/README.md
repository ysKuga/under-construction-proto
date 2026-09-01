# box-bot/

手描き風ボックスロボット (box-bot) の試作を格納する。

- `src/components/samples/figure/box-bot` の 3D 実装 (`box-bot-3d`) を土台に、アクションの表示領域を検討する。
- 経緯: #71 (prototypes/box-bot、2D SVG) → #86 (box-bot samples へ昇格) → #107 (samples の 3D 実装を prototypes へコピー、box-bot-01)。
- 検討詳細は `.claude/.steering/issue-108-box-bot-display-area-limit/design.md` (#108) 参照。

## アクション範囲 (表示領域) の限定

課題: canvas を使う場合、表示は canvas の矩形に限定され、これを逸脱するアクション (fall の完全転倒など) は見切れる。\
現状の box-bot-3d は Canvas を設置領域 (Assembly) の約 2 倍に広げ、`z-index` 手当てや `OrbitControls` の注視点ずらしで後始末している。

- 他要素との組み合わせのための領域を `設置領域`、アクションのために設置領域を逸脱させた領域を `表示領域` とする。
- 複数 canvas を並べる構成を想定すると、設置領域を表示領域が逸脱する前提は破綻する。原則として拡大縮小の禁止・設置領域を逸脱するアクションの禁止を置く。

### 方針 (Jira UC-10 より)

- 手足のアクションに限定する案 (シンプル、fall 完全転倒を諦める)。
- 表示領域の中心で回転させ、設置領域との相対位置をアニメーションさせる案 (fall 完全転倒を維持、設置領域自体を操作要素にする)。box-bot-01 ではこちらを採る。
