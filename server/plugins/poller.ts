import { defineNitroPlugin } from 'nitropack/runtime'
import { getPollerConfig, startMetricsPoller, type PollerRuntime } from '../lib/poller'

export default defineNitroPlugin((nitroApp) => {
  const config = getPollerConfig()
  if (!config.enabled) {
    console.info('[poller] disabled')
    return
  }

  const runtime: PollerRuntime | null = startMetricsPoller(config)
  console.info('[poller] started')

  nitroApp.hooks.hook('close', () => {
    runtime?.stop()
    console.info('[poller] stopped')
  })
})
