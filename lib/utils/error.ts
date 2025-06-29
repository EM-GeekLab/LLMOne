export function wrapError(prefix: string, err: unknown) {
  if (err instanceof Error) {
    return new Error(`${prefix}: ${err.message}`, { cause: err })
  }
  return new Error(`${prefix}: ${String(err)}`, { cause: err })
}

export function messageError(prefix: string, err: unknown) {
  if (err instanceof Error) {
    return `${prefix}: ${err.message}`
  }
  return `${prefix}: ${String(err)}`
}
