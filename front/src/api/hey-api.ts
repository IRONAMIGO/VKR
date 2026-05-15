import type { CreateClientConfig } from '@/api/client/client.gen';

console.log('✅ hey-api.ts loaded, baseUrl = /api');

export const createClientConfig: CreateClientConfig = (config) => ({
    ...config,
    baseUrl: '/api',
});