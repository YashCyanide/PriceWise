/** @type {import('next').NextConfig} */
const nextConfig = {
    serverExternalPackages: ['mongoose'],
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'm.media-amazon.com',
            },
        ],
        unoptimized: true,
    },
    webpack: (config, { dev, isServer }) => {
        if (!dev) {
            config.devtool = false;
        }
        return config;
    },
    experimental: {
        optimizePackageImports: ['cheerio', 'axios'],
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: false,
    },
}

module.exports = nextConfig