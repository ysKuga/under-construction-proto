# 決定事項（EN 切れ bubble 本体）

- 2026-09-29: 拒否時の揺れは「揺らす」行為のイベント `FindPath-shake-bot-bubble` として定義した。UI は提示の拒否時に発行するだけで、拒否の理由を扱わない。表示中の bubble が `allowMultiple` で購読する
- 2026-09-29: 救済手段は EN 切れ bubble 自体へ 1 つだけ提示する（#281 で拡張）。状態表示と手段の bubble を分けない
