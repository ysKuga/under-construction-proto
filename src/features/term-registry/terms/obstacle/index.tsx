import { TermLabel } from '../../_components/term-label'
import { defineTerm } from '../../_lib/define-term'
import { TermComponentProps } from '../../types'

/** 用語: 障害物 の表示 */
const ObstacleTermLabel = (props: TermComponentProps) => (
  <TermLabel {...props} term={obstacleTerm}>
    {obstacleTerm.emoji}
  </TermLabel>
)

/** 用語: 障害物 */
export const obstacleTerm = defineTerm({
  component: ObstacleTermLabel,
  description: '通行できないマス',
  emoji: '🪨',
  englishName: 'obstacle',
  name: '障害物',
})
