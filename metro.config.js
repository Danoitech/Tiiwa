const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.assetExts = [...new Set([...config.resolver.assetExts, 'wasm'])];
config.resolver.sourceExts = config.resolver.sourceExts.filter((ext) => ext !== 'wasm');

const previousEnhanceMiddleware = config.server.enhanceMiddleware;
config.server.enhanceMiddleware = (middleware, server) => {
  const enhanced = previousEnhanceMiddleware
    ? previousEnhanceMiddleware(middleware, server)
    : middleware;
  return (req, res, next) => {
    res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    return enhanced(req, res, next);
  };
};

module.exports = config;
