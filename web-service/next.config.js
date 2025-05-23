/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    '@mysten/dapp-kit',
    '@mysten/wallet-kit',
    'lru-cache',
    '@vanilla-extract/css'
  ],
  webpack: (config, { isServer }) => {
    // Add a rule to handle ESM modules
    config.module.rules.push({
      test: /\.m?js$/,
      type: 'javascript/auto',
      resolve: {
        fullySpecified: false
      }
    });

    return config;
  }
};

module.exports = nextConfig; 