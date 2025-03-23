import { createContext, useContext as useReactContext, type Provider as ReactProvider } from 'react'

export interface CreateSafeContextResult<T> {
  Provider: ReactProvider<T>
  useContext: () => T
}

export function createSafeContext<T>(
  errorMessage = 'useContext must be used within a ContextProvider',
): CreateSafeContextResult<T> {
  const Context = createContext<T | null>(null)

  const Provider = Context.Provider

  const useContext = () => {
    const ctx = useReactContext(Context)
    if (ctx === null) {
      throw new Error(errorMessage)
    }
    return ctx
  }

  return { Provider, useContext }
}
