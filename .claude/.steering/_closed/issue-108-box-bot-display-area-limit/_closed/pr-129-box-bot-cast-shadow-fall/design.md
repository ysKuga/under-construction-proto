# box-bot-01 cast shadow の fall 追従

- 親 issue: #108 (`../../design.md`「詰めるパラメータ」節の「影の追従 … cast は未対応」)
- PR: #129
- base: main (PR #128 マージ済み)

## 目的

box-bot-01 の fall (フェーズ1) で `shadowVariant="cast"` の投影影を転倒に追従させる。

- `contact` (drei `Shadow` の楕円) は fall の `shadowLift` で影グループの `position.y` を
  進行度同期で持ち上げ、中心 pivot で浮いた体へ寄せている。
- `cast` (平行光源のシャドウマッピング、受け皿 plane) は受け皿が接地面固定のまま。
  転倒で足が浮くと、受け皿へ落ちる投影影が体から離れて見える。

## 背景・制約

- `CastShadow` 現状: `<mesh position={position} receiveShadow rotation={GROUND_ROTATION}>` の
  1 枚 plane (`shadowMaterial`)。`directionalLight castShadow` + sketch-box の `castShadow` mesh から
  影を受ける。
- fall の影配線: `index.tsx` が `shadowLiftRef` (`Group` ref) を作り、`contact` 時のみ
  `<ContactShadow liftRef={shadowLiftRef}>` へ渡す。adapter の `applyShadowLift(y)` →
  `writeShadowLift` → `shadowLiftRef.current.position.y = y`。fall の `useFrame` が
  `applyShadowLift(shadowLift * posture)` を毎フレーム適用、get-up で 0。
- `FallConfig.shadowLift` 既定 0.5 (world +y、`contact` 楕円向けに調整済み)。
- `applyShadowLift` は「今マウントされている影」を持ち上げる意味なので、`cast` にも同じ
  `shadowLiftRef` を渡せば variant 切替に関係なく効く。新規 host verb・ref は不要。

## 実装計画

### 1. `_components/cast-shadow/index.tsx`

- `liftRef?: RefObject<Group | null>` prop を追加 (`contact-shadow` と同じ型・意味)。
- 構造を `<group position={position}><group ref={liftRef}><mesh receiveShadow rotation={GROUND_ROTATION}>…`
  へ。`position` を外側 group、`liftRef` group がその子、`mesh` は rotation のみ。
  `contact-shadow` の入れ子 (`position` group → `liftRef` group → 内容) に合わせる。
  `facing` 回転は cast には不要 (実投影が向きを扱う)。
- component JSDoc に「fall 中は `liftRef` group を進行度同期で持ち上げて投影影を体へ寄せる」を追記。
- inline param 型の各プロパティへ JSDoc (`contact-shadow` に揃える)。

### 2. `index.tsx`

- `<CastShadow opacity={shadowOpacity} position={groundPosition} />` に
  `liftRef={shadowLiftRef}` を追加。

### 3. `_actions/fall/index.stories.tsx`

- `shadowVariant` トグル (contact / cast) と `shadowLift` スライダーを既存スライダー群へ追加。
  `shadowLift` は dispatch の `detail` へ (shiftDistance / dropDistance / armAngle と同じ経路)。
- 9 体すべてに `shadowVariant` を渡す。cast で 8 方向の転倒を見て `shadowLift` を実測する。

## 既知の副作用 / 実測ポイント

- 受け皿 plane を world +y へ上げると、斜め光源 ([4,6,4]) では投影影が光源と反対方向へ
  わずかに水平移動する (`shadowLift * light_xz / light_y` ≒ 0.5 * 4/6 ≒ 0.33 world)。
  傾いた体の下へ影が動く向きなので概ね自然。ズレが目立つ場合は `shadowLift` を下げるか、
  `cast` 専用の値 (`FallConfig` へ `castShadowLift` 追加) を検討する — まず共通値で実測。
- `shadowLift` 既定 0.5 は `contact` 楕円で調整した値。`cast` で最適値が違えば story スライダーで
  詰め、必要なら既定を見直す (詰まらなければ共通のまま)。

## 確認

- Fall story を `shadowVariant="cast"` で開き、Fall / Get up で 8 方向の転倒時に投影影が体の
  近くへ追従し、get-up で元へ戻ること。`contact` は従来どおり。
- `check-types` / `oxlint` / `eslint`。

## 非対象

- samples box-bot の cast shadow (別実装、fall のフェーズ1 対象外)。
- cast の影の形・濃さ・光源方向のチューニング。追従 (lift) のみ。
