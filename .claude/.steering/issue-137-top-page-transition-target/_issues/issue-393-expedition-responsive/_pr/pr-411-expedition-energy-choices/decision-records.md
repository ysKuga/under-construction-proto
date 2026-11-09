# 決定事項（EN スポットの使用・EN 切れの救助の選択肢パネルへの移設）

- 2026-11-07: steering を作成した
- 2026-11-07（作り直し）: PR #412 の登録の仕組みの上で作り直した
  - 初版は EN の選択肢の handler を部品 hook の引数・`UseChoicePanelContentReturn` へ足し、密結合だった
  - `_choices/energy-spot`・`_choices/rescue` を足し、`ExpeditionChoices` へ 2 行
  - 文言
    - EN スポット: 「EN スポットで補給」
    - 救助: 手持ちあり「<アイコン>使う」・なし「チェックポイントへ戻る」
  - フェーズ: 吹き出しの `showBubbles` でなく `operateStage` で絞る（操作の選択肢のため）
  - 吹き出しの削除: 移設に伴う旧実装の撤去として同じ PR に含める（コミットは分ける）
    - `bot-bubbles`・`_components/energy-*-bubble` は feature-addition-scope の「変えてよいもの」の外
  - EN スポットの選択肢は player の現在セルを購読する。自動移動中は 1 マスごとに `ExpeditionChoices` が再レンダリングされる
    - 描画は `null`、登録は `useMemo` で変わらないため許容
