import { TermLabel } from '../../_components/term-label'
import { defineTerm } from '../../_lib/define-term'
import { TermComponentProps } from '../../types'

/** 用語: EN 補給アイテム */
export const energyRecoveryItemTerm = defineTerm(
  {
    description: 'エネルギーを補給するアイテム。1個限り',
    englishName: 'energy-recovery-item',
    icon: '🔋',
    name: 'EN 補給アイテム',
  },
  (term) => (props: TermComponentProps) => (
    <TermLabel {...props} term={term}>
      {term.icon}
    </TermLabel>
  ),
)
