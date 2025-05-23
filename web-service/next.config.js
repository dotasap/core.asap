/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
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