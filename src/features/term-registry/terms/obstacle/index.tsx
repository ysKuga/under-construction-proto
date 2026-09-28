import { TermLabel } from '../../_components/term-label'
import { defineTerm } from '../../_lib/define-term'
import { TermComponentProps } from '../../types'

/** 用語: 障害物 */
export const obstacleTerm = defineTerm(
  {
    description: '通行できないマス',
    englishName: 'obstacle',
    icon: '🪨',
    name: '障害物',
  },
  (term) => (props: TermComponentProps) => (
    <TermLabel {...props} term={term}>
      {term.icon}
    </TermLabel>
  ),
)
