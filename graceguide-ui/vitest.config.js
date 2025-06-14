import { defineConfig } from 'vitest/config';
export default defineConfig({
<<<<<< codex/set-up-pytest-for-backend-tests
  test: {
    environment: 'jsdom'
  }
=======
  test: { environment: 'jsdom' }
>>>>>> main
});
