# action-circle

bot 囲む真円、外周へ等間隔配置。画面座標(screen space)ベース、3D 投影計算なし。

bot 表示領域とのコンテナ配置は `../../_components/bot-overlay` が担う(詳細はそちらの `CLAUDE.md` 参照)。`index.stories.tsx` は `../../_story-decorators` の `withBot` decorator 経由で利用する。
