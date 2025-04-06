export function debug<T>(v: T, tag?: string): T {
  if (tag) {
    console.log(tag, v)
  } else {
    console.log(v)
  }
  return v
}

export async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
