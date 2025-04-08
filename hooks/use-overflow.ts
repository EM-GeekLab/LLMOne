import { RefObject, useEffect, useState } from 'react'

export function useOverflow({
  containerRef,
  childRef,
}: {
  containerRef: RefObject<HTMLElement | null>
  childRef: RefObject<HTMLElement | null>
}) {
  const [isStart, setIsStart] = useState(false)
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
    const handleScroll = (e: Event) => {
      const { scrollLeft, scrollWidth, clientWidth } = e.target as HTMLDivElement
      setIsStart(scrollLeft === 0)
      setIsEnd(scrollLeft + clientWidth >= scrollWidth)
    }
    const el = containerRef.current
    setIsStart(el.scrollLeft === 0)
    setIsEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth)
    el.addEventListener('scroll', handleScroll)
    return () => el.removeEventListener('scroll', handleScroll)
  }, [childRef, containerRef])

  return {
    isRightOverflow,
    isStart,
    isEnd,
  }
}
