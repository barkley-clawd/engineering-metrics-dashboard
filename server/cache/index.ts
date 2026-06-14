interface TimedEntry<T> {
  data: T
  expiresAt: number
}

export class TtlCache<T = unknown> {
  private store = new Map<string, TimedEntry<T>>()
  private readonly defaultTtlMs: number

  constructor(defaultTtlMs = 60_000) {
    this.defaultTtlMs = defaultTtlMs
  }

  get(key: string): T | undefined {
    const entry = this.store.get(key)
    if (!entry) return undefined
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key)
      return undefined
    }
    return entry.data
  }

  set(key: string, data: T, ttlMs = this.defaultTtlMs): void {
    this.store.set(key, { data, expiresAt: Date.now() + ttlMs })
  }

  delete(key: string): void {
    this.store.delete(key)
  }

  clear(): void {
    this.store.clear()
  }
}
