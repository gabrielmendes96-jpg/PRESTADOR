import { defineConfig } from 'vite'

// Config separada pros testes de integração (tests/integration/**) —
// fazem chamadas reais de rede pro Supabase/Asaas, então rodam à parte
// do "npm test" normal, via "npm run test:integration".
export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/integration/**/*.test.js'],
    testTimeout: 30000,
  },
})
