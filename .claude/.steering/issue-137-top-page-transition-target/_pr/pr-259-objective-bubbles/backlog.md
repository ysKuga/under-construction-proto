# 実装計画（目標セル側の bubble 表示）

- [ ] `ObjectiveMarkerLayer` に overlay anchor を追加し、擬似 id で登録する
- [ ] bubble の組（中継点・実行）を部品化し、bot 側・目標側の 2 箇所へ注入する
- [ ] 実ブラウザで確認する
  - 目標側 bubble のクリックで bot 側と同じ動作・同じ表示切替になる
  - 目標 2 マス先での重なり具合
