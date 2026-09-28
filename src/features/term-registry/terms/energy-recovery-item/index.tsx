import { TermLabel } from '../../_components/term-label'
import { defineTerm } from '../../_lib/define-term'
import { TermComponentProps } from '../../types'

/** 用語: 回復アイテム */
export const energyRecoveryItemTerm = defineTerm(
  {
    description: 'エネルギーを回復するアイテム。1個限り',
    englishName: 'energy-recovery-item',
    icon: '🔋',
    name: '回復アイテム',
  },
  (term) => (props: TermComponentProps) => (
    <TermLabel {...props} term={term}>
      {term.icon}
    </TermLabel>
  ),
)
