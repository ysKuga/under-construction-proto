# 決定事項（hex-stage の調整スライダーのデバッグ要素への移動）

- 2026-10-17: 親 backlog の項目を PR #370 として着手した
  - 契機: PR #369 の確認で、ステージ下のスライダー群によりステージと状態表示が横に並んで見えない
  - hex-stage 単体の story は expedition に無いため、args controls 化は対象外
- 2026-10-17（実装）: 計画項目を実装した
  - Storybook で確認した
    - `Default`: ステージ下のスライダーが無くなり、ステージと状態表示が横に並ぶ
    - `Debug`: スライダー 7 個が debug-panel 内にあり、tilt・移動時間が反映される
  - 調整値は `display-settings` store にあるため、リセットで既定値へ戻る
