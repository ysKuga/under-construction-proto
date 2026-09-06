# action-square

bot 囲む四角形、四辺中央へボタン配置。画面座標(screen space)ベース、3D 投影計算なし。

`ACTION_LABELS` 先頭 4 件のみ使用(5件目「足踏み」、四角対応先なく未使用)。

bot 表示領域とのコンテナ配置は `../_components/bot-overlay` が担う(詳細はそちらの `CLAUDE.md` 参照)。`index.stories.tsx` は `../_story-decorators` の `withBot` decorator 経由で利用する。
