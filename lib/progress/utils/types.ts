export type PartialProgress = {
  name: string
  ratio: number
  completed: number
  status: 'idle' | 'running' | 'done' | 'error'
  message?: string
  type: 'fake' | 'real'
  progress?: number
}
