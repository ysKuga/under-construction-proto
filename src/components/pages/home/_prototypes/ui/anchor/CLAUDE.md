# anchor

各ボタン、対応する bot 部位のそば(左腕→左腕横、転倒→頭上、足踏み→脚元 等)へ配置。画面座標(screen space)ベース、3D 投影計算なし。

ラベルと操作対象の対応が一目でわかる点、circle/square(幾何学配置)と異なる。box-bot 基準姿勢(直立・非回転)前提の目視調整値、ジャンプ等で姿勢動くとずれる。

bot 表示領域とのコンテナ配置は `../../_components/bot-overlay` が担う(詳細はそちらの `CLAUDE.md` 参照)。`index.stories.tsx` は `../../_story-decorators` の `withBot` decorator 経由で利用する。
