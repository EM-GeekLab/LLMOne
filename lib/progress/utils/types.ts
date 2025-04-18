export type PartialProgress = {
  ratio: number
  completed: number
  status: 'idle' | 'running' | 'done' | 'error'
  idleMessage?: string
  runningMessage?: string
  doneMessage?: string
  errorMessage?: string
  type: 'fake' | 'real'
  progress?: number
}
