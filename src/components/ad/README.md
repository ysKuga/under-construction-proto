# components/ad/

components/ 配下で共通実装になるものを格納する。

## Atomic Design

<https://atomicdesign.bradfrost.com/>

ディレクトリの構成は Atomic Design のものを利用する。\
ただし organisms 以降について必要性を検討して追加を行う。

- atoms/
- molecules/
- organisms/
  - components/ui/ 配下に格納か
  - organisms 単位で共通実装を用意するかは未定
- templates/
  - 作成をするのであれば components/templates/ などとするか
    - これを用意する場合 components/ui/ を依存対象とする可能性が高いため
- pages/
  - templates と同様に components/pages/ とするか features/pages/ などとするか
