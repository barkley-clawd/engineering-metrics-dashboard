import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals'

const mocks = {
  startServerPlugins: jest.fn<() => Promise<unknown>>(),
}

jest.mock('../../server/plugins', () => ({
  startServerPlugins: mocks.startServerPlugins,
}))

const ORIGINAL_ENV = process.env

describe('Next instrumentation', () => {
  beforeEach(() => {
    jest.resetModules()
    jest.clearAllMocks()
    process.env = { ...ORIGINAL_ENV }
    delete process.env.NEXT_RUNTIME
    delete process.env.NEXT_PHASE
  })

  afterEach(() => {
    process.env = ORIGINAL_ENV
  })

  it('starts server plugins for the Node runtime', async () => {
    mocks.startServerPlugins.mockResolvedValue({ poller: null, stop: jest.fn() })

    const { register } = await import('./instrumentation')
    await register()

    expect(mocks.startServerPlugins).toHaveBeenCalledTimes(1)
  })

  it('does not start server plugins for edge runtime or production build phase', async () => {
    const edge = await import('./instrumentation')
    process.env.NEXT_RUNTIME = 'edge'

    await edge.register()

    expect(mocks.startServerPlugins).not.toHaveBeenCalled()

    jest.resetModules()
    process.env = { ...ORIGINAL_ENV, NEXT_PHASE: 'phase-production-build' }
    const build = await import('./instrumentation')

    await build.register()

    expect(mocks.startServerPlugins).not.toHaveBeenCalled()
  })
})
