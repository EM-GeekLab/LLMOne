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

import { RefObject, useEffect, useState } from 'react'

/**
 * A hook to detect if an element is overflowing its container.
 * @returns
 * 1. isRightOverflow - Whether the child element is overflowing to the right.
 * 2. isStart - Whether the scroll position is at the start (left).
 * 3. isEnd - Whether the scroll position is at the end (right).
 */
export function useOverflow({
  containerRef,
  childRef,
}: {
  containerRef: RefObject<HTMLElement | null>
  childRef: RefObject<HTMLElement | null>
}) {
  const [isStart, setIsStart] = useState(true)
  const [isRightOverflow, setIsRightOverflow] = useState(false)
  const [isEnd, setIsEnd] = useState(false)

  useEffect(() => {
    if (!containerRef.current || !childRef.current) return
    const observer = new IntersectionObserver(([entry]) => setIsRightOverflow(entry.isIntersecting), {
      root: containerRef.current,
      rootMargin: '0px 0px 0px -100%',
    })
    observer.observe(childRef.current)
    return () => observer.disconnect()
  }, [childRef, containerRef])

  useEffect(() => {
    if (!containerRef.current || !childRef.current) return
    const el = containerRef.current

    const handleScroll = () => {
      const { scrollLeft, scrollWidth, clientWidth } = el
      setIsStart(scrollLeft === 0)
      setIsEnd(scrollLeft + clientWidth >= scrollWidth)
    }

    setIsStart(el.scrollLeft === 0)
    setIsEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth)

    el.addEventListener('scroll', handleScroll)
    window.addEventListener('resize', handleScroll)

    return () => {
      el.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [childRef, containerRef])

  return {
    isRightOverflow,
    isStart,
    isEnd,
  }
}
