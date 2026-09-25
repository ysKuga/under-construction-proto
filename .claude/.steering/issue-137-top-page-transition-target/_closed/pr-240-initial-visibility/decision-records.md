# decision-records

- 2026-09-25: 3モードは「霧セル集合」の選択で表現する。「隣接後は表示／離れると再度非表示」は既存の `showVisited` トグルを流用し、`all-hidden` / `partial` 共通で効かせる
- 2026-09-25: `partial` の霧セルは `constants.ts` の固定領域とする（距離基準・ランダムは対象外）。モードはプレイ中に select で切替可能、初期値は prop / story args
- 2026-09-25: 霧の状態・判定は fog store（zustand vanilla）へ分離し、`VisibilityRegistryProvider` は DOM の登録・反映のみにする。適用・解除をしやすくするため
