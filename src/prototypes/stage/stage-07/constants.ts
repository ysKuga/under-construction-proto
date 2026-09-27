import { CSSProperties } from 'react'

/**
 * 値調整スライダーの label スタイル
 *
 * - 1 要素 1 行にし、見出し | バー | 値 の列を全 label で同じ幅に揃える
 * - `Stage07` の `extraSliders` へ差し込むスライダーも同じ列幅に揃えるため export する
 */
export const SLIDER_LABEL_STYLE: CSSProperties = {
  alignItems: 'center',
  columnGap: 8,
  display: 'grid',
  gridTemplateColumns: '10em 160px auto',
}
