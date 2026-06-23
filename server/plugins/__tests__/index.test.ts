import { describe, it, expect, jest, beforeEach } from '@jest/globals'

const mocks = {
  mockStartDb: jest.fn(),
  mockStopDb: jest.fn(),
  mockStartAppPoller: jest.fn(),
  mockStopAppPoller: jest.fn(),
}

jest.mock('../db', () => ({
  startDb: mocks.mockStartDb,
  stopDb: mocks.mockStopDb,
}))

jest.mock('../poller', () => ({
  startAppPoller: mocks.mockStartAppPoller,
  stopAppPoller: mocks.mockStopAppPoller,
}))

import { startServerPlugins, stopServerPlugins } from '../index'

describe('server plugin entrypoint', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    delete (globalThis as typeof globalThis & {
      [key: symbol]: unknown
    })[Symbol.for('signal-house.server-plugins')]
  })

  it('starts database before starting poller', async () => {
    const calls: string[] = []
    const poller = { stop: jest.fn() }

    mocks.mockStartDb.mockImplementation(async () => {
      calls.push('db')
    })
    mocks.mockStartAppPoller.mockImplementation(async () => {
      calls.push('poller')
      return poller
    })

    const runtime = await startServerPlugins()

    expect(calls).toEqual(['db', 'poller'])
    expect(runtime.poller).toBe(poller)
  })

  it('stops poller before closing database', async () => {
    const calls: string[] = []
    const poller = { stop: jest.fn() }

    mocks.mockStartDb.mockResolvedValue(undefined)
    mocks.mockStartAppPoller.mockResolvedValue(poller)
    mocks.mockStopAppPoller.mockImplementation(() => {
      calls.push('poller')
    })
    mocks.mockStopDb.mockImplementation(() => {
      calls.push('db')
    })

    const runtime = await startServerPlugins()
    stopServerPlugins(runtime)

    expect(mocks.mockStopAppPoller).toHaveBeenCalledWith(poller)
    expect(calls).toEqual(['poller', 'db'])
  })

  it('does not start plugins twice in the same process', async () => {
    const poller = { stop: jest.fn() }

    mocks.mockStartDb.mockResolvedValue(undefined)
    mocks.mockStartAppPoller.mockResolvedValue(poller)

    const first = await startServerPlugins()
    const second = await startServerPlugins()

    expect(second).toBe(first)
    expect(mocks.mockStartDb).toHaveBeenCalledTimes(1)
    expect(mocks.mockStartAppPoller).toHaveBeenCalledTimes(1)

    stopServerPlugins(first)
    const third = await startServerPlugins()

    expect(third).not.toBe(first)
    expect(mocks.mockStartDb).toHaveBeenCalledTimes(2)
    expect(mocks.mockStartAppPoller).toHaveBeenCalledTimes(2)
  })

  it('does not throw when no runtime was started', () => {
    expect(() => stopServerPlugins(null)).not.toThrow()
  })
})
