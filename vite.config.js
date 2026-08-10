import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node',
    // Testes de integração rodam à parte (npm run test:integration) —
    // fazem chamadas reais de rede e não devem entrar no "npm test" normal.
    exclude: ['**/node_modules/**', '**/dist/**', 'tests/integration/**'],
  },
})
