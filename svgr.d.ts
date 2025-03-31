declare module '@/icons/*.svg' {
  import { FC, SVGProps } from 'react'
  const content: FC<SVGProps<SVGElement>>
  export default content
}

declare module '@/icons/*.svg?url' {
  const content: any
  export default content
}
