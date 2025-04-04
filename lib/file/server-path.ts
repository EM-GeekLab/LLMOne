import { join } from 'path'

/**
 * Add absolute paths to the specified fields in the object, without modifying the original object.
 * @param obj Input object
 * @param basePath Base path to prepend to the fields
 * @param fields Fields to add absolute paths to
 * @returns New object with absolute paths added to the specified fields
 */
export function addAbsolutePaths<T extends object>(obj: T, basePath: string, fields: (keyof T)[]): T {
  return fields.reduce(
    (acc, field) => {
      if (typeof obj[field] === 'string') {
        acc[field] = join(basePath, obj[field]) as T[keyof T]
      }
      return acc
    },
    { ...obj },
  )
}
