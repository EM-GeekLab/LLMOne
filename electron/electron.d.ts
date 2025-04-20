declare global {
  interface Window {
    env: {
      platform: NodeJS.Platform
      trpcPort: number
    }
  }
}

export {}
