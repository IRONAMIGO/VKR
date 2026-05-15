import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
    input: './openapi.json',
    output: './src/api/client',
    plugins: [
        {
            name: '@hey-api/client-fetch',
            runtimeConfigPath: './src/api/hey-api.ts',
        },
    ],
});