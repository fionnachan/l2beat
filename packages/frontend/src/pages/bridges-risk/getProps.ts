import { Bridge, ProjectRiskViewEntry } from '@l2beat/config'
import { ApiMain } from '@l2beat/types'

import { orderByTvl } from '../../utils/orderByTvl'
import { Wrapped } from '../Page'
import { BridgesRiskPageProps } from './BridgesRiskPage'
import { BridgesRiskViewEntry } from './BridgesRiskView'

export function getProps(
  bridges: Bridge[],
  apiMain: ApiMain,
): Wrapped<BridgesRiskPageProps> {
  const ordering = orderByTvl(bridges, apiMain)
  return {
    props: {
      items: ordering.map(
        (bridge): BridgesRiskViewEntry => ({
          name: bridge.display.name,
          slug: bridge.display.slug,
          type: bridge.technology.type,
          destination: getDestination(bridge.technology.destination),
          ...bridge.riskView,
        }),
      ),
    },
    wrapper: {
      metadata: {
        description: '',
        image: '',
        title: '',
        url: '',
      },
    },
  }
}

function getDestination(destinations: string[]): ProjectRiskViewEntry {
  if (destinations.length === 0) {
    throw new Error('Invalid destination')
  }
  if (destinations.length === 1) {
    return { value: destinations[0], description: '' }
  }
  if (destinations.length === 2) {
    return { value: destinations.join(', '), description: '' }
  }
  return { value: 'Multichain', description: destinations.join(', ') }
}