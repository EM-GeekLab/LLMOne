export function debug<T>(v: T, tag?: string): T {
  if (tag) {
    console.log(tag, v)
  } else {
    console.log(v)
  }
  return v
}
