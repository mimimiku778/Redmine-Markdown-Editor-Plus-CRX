/// <reference types="vite/client" />

declare global {
  const __DEV__: boolean
  
  interface Document {
    caretRangeFromPoint?: (x: number, y: number) => Range | null
  }
}

export {}
