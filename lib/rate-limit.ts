import { LRUCache } from "lru-cache"

type Options = {
    uniqueTokenPerInterval?: number
    interval?: number
}

export default function rateLimit(options?: Options) {
    const tokenCache = new LRUCache({
        max: options?.uniqueTokenPerInterval || 500,
        ttl: options?.interval || 60000,
    })

    return {
        check: (limit: number, token: string) =>
            new Promise<void>((resolve, reject) => {
                const tokenCount = (tokenCache.get(token) as number[]) || [0]
                if (tokenCount[0] === 0) {
                    tokenCache.set(token, tokenCount)
                }
                tokenCount[0] += 1

                const currentUsage = tokenCount[0]
                const isRateLimited = currentUsage >= limit

                // In Next.js App Router, we don't manipulate response headers directly in the same way as Pages Router middleware
                // But we can return headers to be set if needed, or just throw error.
                // For simple API routes, we just reject if limited.

                if (isRateLimited) {
                    reject()
                } else {
                    resolve()
                }
            }),
    }
}
