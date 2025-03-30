/**
 * Add typed input without validation
 */
export function inputType<T>(input: unknown) {
  return input as T
}
