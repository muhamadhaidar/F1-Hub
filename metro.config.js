const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

const { resolver } = config;

// Ensure wasm is treated as an asset so it's not parsed as JS
config.resolver.assetExts.push('wasm');
config.resolver.sourceExts = resolver.sourceExts.filter(ext => ext !== 'wasm');

module.exports = config;
