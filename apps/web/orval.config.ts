import { defineConfig } from 'orval';

export default defineConfig({
  babydja: {
    input: '../api/swagger.json',
    output: {
      mode: 'tags-split',
      target: 'src/lib/api/generated',
      schemas: 'src/lib/api/generated/model',
      client: 'react-query',
      mock: false,
      override: {
        mutator: {
          path: 'src/lib/http.ts',
          name: 'customInstance',
        },
      },
    },
  },
});
