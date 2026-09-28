import { TermLabel } from '../../_components/term-label'
import { defineTerm } from '../../_lib/define-term'
import { TermComponentProps } from '../../types'

/** 用語: 回復アイテム の表示 */
const EnergyRecoveryItemTermLabel = (props: TermComponentProps) => (
  <TermLabel {...props} term={energyRecoveryItemTerm}>
    {energyRecoveryItemTerm.emoji}
  </TermLabel>
)

/** 用語: 回復アイテム */
export const energyRecoveryItemTerm = defineTerm({
  component: EnergyRecoveryItemTermLabel,
  description: 'エネルギーを回復するアイテム。1個限り',
  emoji: '🔋',
  englishName: 'energy-recovery-item',
  name: '回復アイテム',
})
