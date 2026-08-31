import { describe, it, expect } from 'vitest'
import { getProjects } from './api'

describe('api', () => {
  it('returns mock data', async () => {
    expect(await getProjects()).toBeDefined()
  })
})