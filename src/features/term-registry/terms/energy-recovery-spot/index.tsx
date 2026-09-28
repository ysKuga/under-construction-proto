import { TermLabel } from '../../_components/term-label'
import { defineTerm } from '../../_lib/define-term'
import { TermComponentProps } from '../../types'

/** 用語: 回復スポット */
export const energyRecoverySpotTerm = defineTerm(
  {
    description: 'エネルギーを回復する据置の地点。在庫が尽きるまで複数回使える',
    emoji: '⛽',
    englishName: 'energy-recovery-spot',
    name: '回復スポット',
  },
  (term) => (props: TermComponentProps) => (
    <TermLabel {...props} term={term}>
      {term.emoji}
    </TermLabel>
  ),
)
