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
                className="size-4 text-muted-foreground data-[state=open]:rotate-90 data-[state=open]:text-primary"
              />
            </div>
          </button>
          {useCustomCredentials && (
            <div className="mt-1 flex gap-1.5 text-xs text-muted-foreground">
              <span>留空的字段将使用默认凭据</span>
              {showClearButton && (
                <button
                  type="button"
                  className="font-medium text-primary hover:text-primary/90"
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

export function useFieldsHasAnyValue<T extends FieldValues = FieldValues>({
  watch,
  fields,
  defaultHasAnyValue = false,
}: {
  watch: UseFormWatch<T>
  fields: Path<T>[]
  defaultHasAnyValue?: boolean
}) {
  const [hasAnyValue, setHasAnyValue] = useState(defaultHasAnyValue)

  useShallowEffect(() => {
    const { unsubscribe } = watch((values, { name }) => {
      if (name && fields.includes(name)) {
        if (fields.some((f) => Boolean(values[f]))) {
          setHasAnyValue(true)
        } else {
          setHasAnyValue(false)
        }
      }
    })
    return () => unsubscribe()
  }, [watch, fields])

  return hasAnyValue
}
