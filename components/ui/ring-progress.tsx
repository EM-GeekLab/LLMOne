import { ComponentProps } from 'react'

import { cn } from '@/lib/utils'

export interface RingProgressProps extends ComponentProps<'div'> {
  value?: number
  max?: number
  thickness?: number
  size?: number
  rounded?: boolean
  rangeClassname?: string
}

const RingProgress = ({
  value = 0,
  max = 100,
  thickness = 6,
  size = 72,
  rounded,
  className,
  rangeClassname,
  children,
  ...props
}: RingProgressProps) => {
  const curveProps: CurveProps = {
    size,
    max,
    className: rangeClassname,
    thickness: Math.min(thickness, size / 4),
  }

  return (
    <div
      role="progressbar"
      data-value={value}
      data-max={max}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-valuetext={`${Math.round((value / max) * 100)}%`}
      className={cn('relative', className)}
      {...props}
    >
      <svg className="-rotate-90" width={size} height={size}>
        <Curve root {...curveProps} />
        <Curve rounded={rounded} value={value} {...curveProps} />
      </svg>
      {children && (
        <div
          className="absolute top-1/2 flex -translate-y-1/2 flex-col items-center justify-center"
          style={{ insetInline: thickness * 2 }}
        >
          {children}
        </div>
      )}
    </div>
  )
}

interface CurveProps extends ComponentProps<'circle'> {
  rounded?: boolean
  value?: number
  max?: number
  size: number
  thickness: number
  root?: boolean
}

const Curve = ({ rounded = true, size, value = 0, max = 100, thickness, root, className, ...props }: CurveProps) => {
  const radius = (size - thickness) / 2
  const perimeter = Math.PI * radius * 2

  return (
    <circle
      fill="none"
      data-root={root ? '' : undefined}
      className={cn('stroke-primary data-root:stroke-muted transition-[stroke-dashoffset] duration-200', className)}
      cx={size / 2}
      cy={size / 2}
      r={radius}
      strokeWidth={thickness}
      strokeLinecap={!root && rounded ? 'round' : 'butt'}
      strokeDasharray={root ? undefined : `${perimeter}, ${perimeter}`}
      strokeDashoffset={root ? undefined : (1 - Math.min(value, max) / max) * perimeter}
      {...props}
    />
  )
}

export { RingProgress }
