import { ReactNode, useState } from 'react'
import { useShallowEffect } from '@mantine/hooks'
import { ChevronRightIcon } from 'lucide-react'
import type { FieldValues, Path, UseFormWatch } from 'react-hook-form'

export function CustomCredentialsSection({
  children,
  withDefaultCredentials,
  defaultOpen = false,
  onClear,
  showClearButton = true,
}: {
  children?: ReactNode
  withDefaultCredentials?: boolean
  defaultOpen?: boolean
  onClear?: () => void
  showClearButton?: boolean
}) {
  const [useCustomCredentials, setUseCustomCredentials] = useState(defaultOpen)
  return (
    <>
      {withDefaultCredentials && (
        <div>
          <button type="button" className="block text-left" onClick={() => setUseCustomCredentials((v) => !v)}>
            <div className="flex items-center gap-1.5">
              <div className="text-sm font-medium">使用自定义凭据</div>
              <ChevronRightIcon
                data-state={useCustomCredentials ? 'open' : 'closed'}
                className="text-muted-foreground data-[state=open]:text-primary size-4 data-[state=open]:rotate-90"
              />
            </div>
          </button>
          {useCustomCredentials && (
            <div className="text-muted-foreground mt-1 flex gap-1.5 text-xs">
              <span>留空以使用默认凭据</span>
              {(showClearButton || defaultOpen) && (
                <button
                  type="button"
                  className="text-primary hover:text-primary/90 font-medium"
                  onClick={() => onClear?.()}
                >
                  清空输入
                </button>
              )}
            </div>
          )}
        </div>
      )}
      {(!withDefaultCredentials || useCustomCredentials) && <>{children}</>}
    </>
  )
}

export function useFieldsHasAnyValue<T extends FieldValues = FieldValues>(watchFn: UseFormWatch<T>, fields: Path<T>[]) {
  const [hasAnyValue, setHasAnyValue] = useState(false)

  useShallowEffect(() => {
    const { unsubscribe } = watchFn((values, { name }) => {
      if (name && fields.includes(name)) {
        if (fields.some((f) => Boolean(values[f]))) {
          setHasAnyValue(true)
        } else {
          setHasAnyValue(false)
        }
      }
    })
    return () => unsubscribe()
  }, [watchFn, fields])

  return hasAnyValue
}
