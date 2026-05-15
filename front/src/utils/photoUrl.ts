import { client } from '@/api/client/client.gen'

export function getPhotoUrl(imagePath: string): string {
    const base = client.getConfig().baseUrl?.replace(/\/+$/, '') ?? ''
    return `${base}${imagePath}`
}