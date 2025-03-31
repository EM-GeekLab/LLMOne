import { partial } from 'filesize'

export const readableSize: (byteCount: number | string | bigint) => string = partial({ standard: 'jedec' })
