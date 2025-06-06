/// <reference types="vite/client" />

declare global {
  interface Document {
    caretRangeFromPoint?: (x: number, y: number) => Range | null
  }
}

export {}
