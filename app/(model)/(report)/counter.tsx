import { differenceInSeconds } from 'date-fns'

import { useCountdown } from '@/components/base/countdown'

export function Counter({ from }: { from?: Date }) {
  return <TimeCounter key={from ? 'has-from' : 'no-from'} from={from} />
}

function TimeCounter({ from }: { from?: Date }) {
  const distance = from ? differenceInSeconds(new Date(), from) : 0
  const { duration } = useCountdown({ direction: 'up', seconds: distance })
  return <time>{duration}</time>
}
