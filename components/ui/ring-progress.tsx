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

import { ComponentProps } from 'react'

import { cn } from '@/lib/utils'

interface VariantProps {
  variant?: 'primary' | 'destructive' | 'success'
}

export interface RingProgressProps extends ComponentProps<'div'>, VariantProps {
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
  variant = 'primary',
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
        <Curve root variant={variant} {...curveProps} />
        <Curve variant={variant} rounded={rounded} value={value} {...curveProps} />
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

interface CurveProps extends ComponentProps<'circle'>, VariantProps {
  rounded?: boolean
  value?: number
  max?: number
  size: number
  thickness: number
  root?: boolean
}

const Curve = ({
  rounded = true,
  size,
  value = 0,
  max = 100,
  thickness,
  root,
  className,
  variant,
  ...props
}: CurveProps) => {
  const radius = (size - thickness) / 2
  const perimeter = Math.PI * radius * 2

  return (
    <circle
      fill="none"
      data-root={root ? '' : undefined}
      className={cn(
        'transition-[stroke-dashoffset] duration-200',
        variant === 'primary' && 'stroke-primary data-root:stroke-primary/20',
        variant === 'destructive' && 'stroke-destructive data-root:stroke-destructive/20',
        variant === 'success' && 'stroke-success data-root:stroke-success/20',
        className,
      )}
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
