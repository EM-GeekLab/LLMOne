declare module '@/public/icons/*.svg' {
  import { FC, SVGProps } from 'react'
  const content: FC<SVGProps<SVGElement>>
  export default content
}

declare module '@/public/icons/*.svg?url' {
  const content: any
  export default content
}
