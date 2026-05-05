import { describe, expect, it } from 'vitest'
import { apiRequest } from '@/api/client'

describe('apiRequest', () => {
  it('throws when client is not configured', async () => {
    await expect(apiRequest('GET', '/api/health')).rejects.toThrow('Cliente API no configurado')
  })
})
