export default function sitemap() {
    return [
        {
            url: 'https://timeguessr.online',
            lastModified: new Date().toISOString(),
            changeFrequency: 'daily',
            priority: 1,
        },
        // https://timeguessr.online/game
        {
            url: 'https://timeguessr.online/game',
            lastModified: new Date().toISOString(),
            changeFrequency: 'daily',
            priority: 1,
        },
        // https://timeguessr.online/leaderboard
        {
            url: 'https://timeguessr.online/leaderboard',
            lastModified: new Date().toISOString(),
            changeFrequency: 'daily',
            priority: 1,
        },
        // https://timeguessr.online/privacy
        {
            url: 'https://timeguessr.online/privacy',
            lastModified: new Date().toISOString(),
            changeFrequency: 'weekly',
            priority: 0.9,
        },
        {
            url: 'https://timeguessr.online/terms',
            lastModified: new Date().toISOString(),
            changeFrequency: 'weekly',
            priority: 0.9,
        },
    ];
} 