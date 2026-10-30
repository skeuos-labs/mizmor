import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const FORBIDDEN = ['@tauri-apps', 'react', 'zustand', 'vite']

function collectTs(dir: string): string[] {
  return readdirSync(dir).flatMap(f => {
    const full = join(dir, f)
    return statSync(full).isDirectory()
      ? collectTs(full)
      : full.endsWith('.ts') && !full.endsWith('.test.ts') ? [full] : []
  })
}

describe('App Coupling Guard', () => {
  it('engine source has no app-layer imports', () => {
    const files = collectTs(join(import.meta.dirname, '.'))
    const violations: string[] = []
    for (const file of files) {
      const content = readFileSync(file, 'utf8')
      for (const banned of FORBIDDEN) {
        if (content.includes(`from '${banned}`) || content.includes(`from "${banned}`)) {
          violations.push(`${file}: imports ${banned}`)
        }
      }
    }
    expect(violations).toEqual([])
  })
})
