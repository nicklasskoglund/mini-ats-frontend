// Extends Vitest's expect with jest-dom matchers (toBeInTheDocument, etc.)
// for every test file, without importing it manually each time.
import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// Without this, RTL doesn't unmount between tests under Vitest's default
// (non-globals) mode, leaking DOM nodes from one test into the next.
afterEach(() => {
  cleanup()
})
