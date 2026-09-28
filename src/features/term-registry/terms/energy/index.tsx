import { TermLabel } from '../../_components/term-label'
import { defineTerm } from '../../_lib/define-term'
import { TermComponentProps } from '../../types'

/** 用語: エネルギー の表示 */
const EnergyTermLabel = (props: TermComponentProps) => (
  <TermLabel {...props} term={energyTerm}>
    {energyTerm.abbreviation}
  </TermLabel>
)

/** 用語: エネルギー */
export const energyTerm = defineTerm({
  abbreviation: 'EN',
  component: EnergyTermLabel,
  description: '移動に必要な量。移動するたびに消費し、尽きると移動できなくなる',
  englishName: 'energy',
  name: 'エネルギー',
})
