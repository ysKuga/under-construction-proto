# not-found-shadow

親: issue-96-app-top-page-readme-style

## 目的

not-found ページ(`src/app/not-found.tsx`)を README/トップページと統一感のある構成にする。親 design.md 検討事項「not-found ページの追加検討」への対応。

## 背景・制約

- 従来の not-found は `<h1>Not Found</h1>` + box-bot(3D、`rotationY={Math.PI}` で背面向き)を `Link` で home へ誘導するのみのシンプル構成だった。
- box-bot(`@/components/samples/figure/box-bot`)は home ページでも使用する共有コンポーネント → 変更は home 側の見た目に影響しないよう配慮が必要。

## 実装計画

- [x] "404" 表示の追加
- [x] タイトル・box-bot の位置調整("404" を隠さない大きさ・配置)
- [x] 接地影を調整可能にする(box-bot 奥側へ長い影を伸ばす演出)

## 決定事項

### "404" 表示方式 (2026-08-25)

- 当初 box-bot 背後に "404" を大型テキストで背景表示する案(`absolute inset-0` + `isolate` で重ね配置)を実装したが、box-bot 本体で数字("0" 等)がほぼ隠れる問題が発生 → 不採用。
- タイトル→"404"→box-bot の縦並び表示に変更。"404" は `text-[12rem]`、box-bot は `style={{ height: 160, width: 160 }}` で数字より明確に小さく実寸縮小し、重なりを回避。

### 接地影の方式 (2026-08-25)

box-bot 奥(数字側)へ影を伸ばす演出を検討。

1. **ContactShadows(俯瞰ブラー式、光源と無関係)の width/height/position prop 化** → 対称配置ゆえ遠い側(奥)は本体に隠れほぼ見えず断念。手前側(カメラ側)への斜めロングシャドウで妥協する案も検討したが、次点の本格対応へ切替。
2. **シャドウマッピング方式(地面 mesh + shadowMaterial + receiveShadow、bot 側は既存の castShadow)へ全面置換** → 光源位置(`lightPosition`)で影の向き・長さを実際に制御可能に。home でも同方式がデフォルトになった結果、見た目が「微妙」(従来のソフトな接地影と印象が変わる)という指摘があり、次項で選択式に変更。
3. **最終形: 2 方式を選択式に分離**
   - `_components/contact-shadow`(旧 ContactShadows。**既定**、home はここに無変更で乗る)
   - `_components/cast-shadow`(新シャドウマッピング)
   - `BoxBot3D` に `shadowVariant`(`'contact'` | `'cast'`, 既定 `'contact'`)/`lightPosition`/`shadowOpacity`/`groundPosition` prop を追加
   - not-found のみ `shadowVariant="cast"` + `lightPosition={[0, 1.5, 6]}`(低め角度)を明示指定し、bot 奥へ伸びる長い影を実現。home は無指定のまま旧方式を維持、見た目は変更前と同一。

### 影の向き(実験メモ)

`lightPosition` の Z 符号を反転させると影が反対側(手前・カメラ側)に伸びることを確認済み(`[0, 1.5, 6]` → 奥/`[0, 1.5, -6]` → 手前)。最終的に採用したのは奥方向(`[0, 1.5, 6]`)。

### box-bot クリック無反応の解消 (2026-08-25)

not-found の box-bot、クリックしても腕上げ/ジャンプしない件 → 原因判明。`BoxBot` に `interactive={false}` を明示指定しており、`BoxBot3D`(既定 `interactive=true`)のインタラクション(腕クリックで上げ下げ、頭/胴クリックでジャンプ)が無効化されていた。`interactive={false}` を削除し解消(コミット `7275480`)。

## 検討事項

- [x] home への戻るクリック時に box-bot を回転させる演出 → 親 design.md へ引き継ぎ、`ACTION_SPIN` 追加で対応完了
