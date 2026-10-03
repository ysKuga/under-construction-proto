import { TermLabel } from '../../_components/term-label'
import { defineTerm } from '../../_lib/define-term'
import { TermComponentProps } from '../../types'

/** 用語: EN スポット */
export const energyChargeSpotTerm = defineTerm(
  {
    description: 'エネルギーを補給する据置の地点。在庫が尽きるまで複数回使える',
    englishName: 'energy-charge-spot',
    icon: '⛽',
    name: 'EN スポット',
  },
  (term) => (props: TermComponentProps) => (
    <TermLabel {...props} term={term}>
      {term.icon}
    </TermLabel>
  ),
)
