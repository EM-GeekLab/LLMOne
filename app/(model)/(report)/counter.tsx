/**
 * Copyright (c) 2025 EM-GeekLab
 * LLMOne is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *          http://license.coscl.org.cn/MulanPSL2
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

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
