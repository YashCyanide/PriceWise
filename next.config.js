/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        serverComponentsExternalPackages: ['mongoose']
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'm.media-amazon.com',
            },
        ],
    },
    webpack: (config, { dev, isServer }) => {
        if (!dev) {
            config.devtool = false;
        }
        return config;
    },
}

module.exports = nextConfig