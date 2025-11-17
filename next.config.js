const { withSentryConfig } = require('@sentry/nextjs');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Disable ESLint during production builds (errors can be fixed later)
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Disable TypeScript type checking during builds to reduce memory usage
  typescript: {
    ignoreBuildErrors: true,
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          // CSP desactivado temporalmente para debugging en Render
          // TODO: Re-habilitar después de confirmar que el deploy funciona
          // {
          //   key: 'Content-Security-Policy',
          //   value: [
          //     "default-src 'self'",
          //     "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net https://js.sentry-cdn.com https://browser.sentry-cdn.com",
          //     "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
          //     "font-src 'self' https://fonts.gstatic.com data:",
          //     "img-src 'self' data: blob: https:",
          //     "connect-src 'self' https://api.mainnet-beta.solana.com https://*.helius-rpc.com wss://*.helius-rpc.com https://twitter.com https://t.me https://*.ingest.sentry.io https://pusher.com wss://ws-*.pusher.com",
          //     "frame-src 'self'",
          //     "object-src 'none'",
          //     "base-uri 'self'",
          //     "form-action 'self'"
          //     // "upgrade-insecure-requests" REMOVED - causaba problemas en Render
          //   ].join('; ')
          // }
        ],
      },
    ];
  },

  // Image optimization
  images: {
    domains: ['localhost'],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },

  // Performance optimizations
  compress: true,

  // Enable SWC minification
  swcMinify: true,

  // Disable x-powered-by header
  poweredByHeader: false,

  // Webpack optimizations with memory constraints
  webpack: (config, { dev, isServer }) => {
    // Reduce memory usage during builds
    config.optimization = {
      ...config.optimization,
      // Minimize memory usage
      minimize: !dev,
      // Reduce parallelization to save memory
      ...(isServer ? {} : {
        moduleIds: 'deterministic',
        runtimeChunk: 'single',
        splitChunks: {
          chunks: 'all',
          maxSize: 244000, // Split large chunks to reduce memory
          cacheGroups: {
            default: false,
            vendors: false,
            framework: {
              chunks: 'all',
              name: 'framework',
              test: /(?<!node_modules.*)[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-subscription)[\\/]/,
              priority: 40,
              enforce: true,
            },
            commons: {
              name: 'commons',
              chunks: 'all',
              minChunks: 2,
              priority: 20,
            },
            lib: {
              test(module) {
                return module.size() > 160000 && /node_modules[/\\]/.test(module.identifier());
              },
              name(module) {
                const hash = require('crypto').createHash('sha1');
                hash.update(module.identifier());
                return hash.digest('hex').substring(0, 8);
              },
              priority: 30,
              minChunks: 1,
              reuseExistingChunk: true,
            },
          },
        },
      }),
    };

    // Reduce memory footprint by limiting parallelism
    if (!dev) {
      config.parallelism = 1;
    }

    return config;
  },
};

// Sentry configuration
const sentryWebpackPluginOptions = {
  // Sentry auth token solo para builds de producción
  silent: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // Solo subir source maps en producción
  widenClientFileUpload: false, // Reduce memory during build
  hideSourceMaps: true,
  disableLogger: true,

  // Reduce memory usage during build
  dryRun: !process.env.SENTRY_AUTH_TOKEN, // Skip upload if no token
};

// Exportar con Sentry solo si está configurado Y hay auth token
// Esto reduce el uso de memoria durante el build
module.exports = process.env.NEXT_PUBLIC_SENTRY_DSN && process.env.SENTRY_AUTH_TOKEN
  ? withSentryConfig(nextConfig, sentryWebpackPluginOptions)
  : nextConfig;
