import { describe, expect, it } from 'vitest'
import { importFile, exportLibrary, convertFile, FORMAT_REGISTRY } from './index.js'

describe('Public API', () => {
  it('public API exports are defined', () => {
    expect(typeof importFile).toBe('function')
    expect(typeof exportLibrary).toBe('function')
    expect(typeof convertFile).toBe('function')
    expect(Array.isArray(FORMAT_REGISTRY)).toBe(true)
    expect(FORMAT_REGISTRY.length).toBeGreaterThan(0)
  })
})
