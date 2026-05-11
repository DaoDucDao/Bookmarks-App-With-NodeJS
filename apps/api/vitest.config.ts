import { defineConfig } from 'vitest/config'

export default defineConfig({
   test: {
      env: {
         NODE_ENV: 'test',
         DATABASE_PATH: ':memory:',
      },
      setupFiles: ['./tests/setup.ts'],
   },
})
