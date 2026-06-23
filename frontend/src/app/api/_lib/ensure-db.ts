import { initDb } from '../../../../../server/db/client'

let dbInitialized = false

export async function ensureDb(): Promise<void> {
  if (!dbInitialized) {
    await initDb()
    dbInitialized = true
  }
}
