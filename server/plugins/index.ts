import { startDb, stopDb } from './db'
import { startAppPoller, stopAppPoller } from './poller'
import type { PollerRuntime } from '../lib/poller'

export interface ServerPluginRuntime {
  poller: PollerRuntime | null
  stop: () => void
}

const SERVER_PLUGINS_KEY = Symbol.for('signal-house.server-plugins')

function getServerPluginState(): { runtime: ServerPluginRuntime | null } {
  const globalState = globalThis as typeof globalThis & {
    [SERVER_PLUGINS_KEY]?: { runtime: ServerPluginRuntime | null }
  }
  if (!globalState[SERVER_PLUGINS_KEY]) {
    globalState[SERVER_PLUGINS_KEY] = { runtime: null }
  }
  return globalState[SERVER_PLUGINS_KEY]!
}

export async function startServerPlugins(): Promise<ServerPluginRuntime> {
  const state = getServerPluginState()
  if (state.runtime) return state.runtime

  await startDb()
  const poller = await startAppPoller()

  const runtime: ServerPluginRuntime = {
    poller,
    stop: () => {
      stopAppPoller(poller)
      stopDb()
      if (state.runtime === runtime) {
        state.runtime = null
      }
    },
  }
  state.runtime = runtime
  return runtime
}

export function stopServerPlugins(runtime: ServerPluginRuntime | null | undefined): void {
  runtime?.stop()
}
