import { describe, it, expect, vi, afterEach } from 'vitest'

vi.mock('viem', () => {
  let callCount = 0
  return {
    createPublicClient: vi.fn(({ transport }) => ({
      _id: ++callCount,
      transport,
    })),
    webSocket: vi.fn((url: string) => ({ type: 'webSocket', url })),
  }
})

import { createPublicClient, webSocket } from 'viem'
import { getWsClient, removeWsClient } from '../ws-client'

const TEST_URL_1 = 'wss://example.com/ws'
const TEST_URL_2 = 'wss://other.example.com/ws'

describe('ws-client', () => {
  afterEach(async () => {
    // Clear the module-level cache between tests so they stay independent.
    await removeWsClient(TEST_URL_1)
    await removeWsClient(TEST_URL_2)
    vi.clearAllMocks()
  })

  describe('getWsClient', () => {
    it('returns undefined when called with undefined', () => {
      const result = getWsClient(undefined)
      expect(result).toBeUndefined()
    })

    it('returns undefined when called with an empty string', () => {
      const result = getWsClient('')
      expect(result).toBeUndefined()
    })

    it('returns a PublicClient for a valid WebSocket URL', () => {
      const client = getWsClient(TEST_URL_1)
      expect(client).toBeTruthy()
      expect(createPublicClient).toHaveBeenCalledOnce()
      expect(webSocket).toHaveBeenCalledWith(TEST_URL_1, {
        reconnect: true,
        keepAlive: true,
        retryCount: 3,
      })
    })

    it('returns the same cached instance for the same URL (memoization)', () => {
      const first = getWsClient(TEST_URL_1)
      const second = getWsClient(TEST_URL_1)

      expect(first).toBe(second)
      // createPublicClient should only have been called once
      expect(createPublicClient).toHaveBeenCalledTimes(1)
    })

    it('returns different instances for different URLs', () => {
      const clientA = getWsClient(TEST_URL_1)
      const clientB = getWsClient(TEST_URL_2)

      expect(clientA).not.toBe(clientB)
      expect(createPublicClient).toHaveBeenCalledTimes(2)
    })

    it('does not call createPublicClient for falsy inputs', () => {
      getWsClient(undefined)
      getWsClient('')

      expect(createPublicClient).not.toHaveBeenCalled()
      expect(webSocket).not.toHaveBeenCalled()
    })
  })

  describe('removeWsClient', () => {
    it('is a no-op when removing a URL that was never cached', async () => {
      // Should not throw
      await expect(
        removeWsClient('wss://never-cached.example.com')
      ).resolves.toBeUndefined()
    })

    it('removes the client from cache so a subsequent getWsClient creates a new one', async () => {
      const first = getWsClient(TEST_URL_1)
      await removeWsClient(TEST_URL_1)
      const second = getWsClient(TEST_URL_1)

      // second should be a new instance, not the same object reference
      expect(second).not.toBe(first)
      expect(createPublicClient).toHaveBeenCalledTimes(2)
    })

    it('calls transport.close when the transport exposes a close function', async () => {
      const closeFn = vi.fn().mockResolvedValue(undefined)

      // Create a client, then patch its transport to include a close method
      const client = getWsClient(TEST_URL_1) as Record<string, unknown>
      ;(client.transport as Record<string, unknown>).close = closeFn

      await removeWsClient(TEST_URL_1)

      expect(closeFn).toHaveBeenCalledOnce()
    })

    it('does not throw when transport has no close function', async () => {
      // The default mock transport from our vi.mock has no close method.
      getWsClient(TEST_URL_1)

      await expect(removeWsClient(TEST_URL_1)).resolves.toBeUndefined()
    })
  })
})
