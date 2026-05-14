declare module 'better-sqlite3-session-store' {
   import type session from 'express-session'
   import type Database from 'better-sqlite3'

   type Options = {
      client: Database.Database
      expired?: { clear?: boolean; intervalMs?: number }
   }

   type StoreConstructor = new (options: Options) => session.Store

   const factory: (sessionImport: typeof session) => StoreConstructor

   export default factory
}
