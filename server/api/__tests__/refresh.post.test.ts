import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const mocks = vi.hoisted(() => ({
  mockRunRefresh: vi.fn(),
  mockCreateError: vi.fn(({ statusCode, statusMessage }: { statusCode: number; statusMessage: string }) => {
    const error = new Error(statusMessage) as Error & { statusCode: number; statusMessage: string }
    error.statusCode = statusCode
    error.statusMessage = statusMessage
    return error
  }),
}))

vi.mock('../../lib/refresh/run-refresh', () => ({
  runRefresh: mocks.mockRunRefresh,
}))

vi.mock('h3', () => ({
  defineEventHandler: (handler: Function) => handler,
  createError: mocks.mockCreateError,
}))

import handler from '../refresh.post'

describe('POST /api/refresh', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('returns the structured success result when a refresh completes', async () => {
    mocks.mockRunRefresh.mockResolvedValue({
      startedAt: '2026-06-15T00:00:00.000Z',
      finishedAt: '2026-06-15T00:00:01.000Z',
      durationMs: 1000,
      success: true,
      partialData: false,
      sources: ['github'],
      warnings: [],
      errors: [],
      errorSummary: null,
      skipped: false,
      skippedReason: null,
      orchestratorResult: null,
    })

    const result = await handler({} as never)

    expect(result).toMatchObject({
      started: true,
      success: true,
      skipped: false,
      sources: ['github'],
    })
  })

  it('rejects with HTTP 409 when a refresh is already in progress', async () => {
    mocks.mockRunRefresh.mockResolvedValue({
      startedAt: '2026-06-15T00:00:00.000Z',
      finishedAt: '2026-06-15T00:00:00.000Z',
      durationMs: 0,
      success: false,
      partialData: false,
      sources: [],
      warnings: [],
      errors: [],
      errorSummary: 'Refresh already in progress',
      skipped: true,
      skippedReason: 'refresh-in-progress',
      orchestratorResult: null,
    })

    await expect(handler({} as never)).rejects.toMatchObject({
      statusCode: 409,
      statusMessage: 'Refresh already in progress',
    })
  })

  it('uses the same skipped result from the shared runner when the poller holds the guard', async () => {
    const scheduledSkippedResult = {
      startedAt: '2026-06-15T00:00:00.000Z',
      finishedAt: '2026-06-15T00:00:00.000Z',
      durationMs: 0,
      success: false,
      partialData: false,
      sources: [],
      warnings: [],
      errors: [],
      errorSummary: 'Refresh already in progress',
      skipped: true,
      skippedReason: 'refresh-in-progress',
      orchestratorResult: null,
    }
    mocks.mockRunRefresh.mockResolvedValue(scheduledSkippedResult)

    await expect(handler({} as never)).rejects.toMatchObject({
      statusCode: 409,
      statusMessage: 'Refresh already in progress',
    })

    expect(mocks.mockCreateError).toHaveBeenCalledWith({
      statusCode: 409,
      statusMessage: 'Refresh already in progress',
    })
  })
})
