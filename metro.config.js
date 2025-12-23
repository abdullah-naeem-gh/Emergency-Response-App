const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

let config = getDefaultConfig(__dirname);

// Configure path alias resolution
config.resolver = {
  ...config.resolver,
  alias: {
    "@": path.resolve(__dirname),
  },
};

// Try to apply NativeWind if available
try {
  const { withNativeWind } = require("nativewind/metro");
  config = withNativeWind(config, { 
    input: "./global.css",
    projectRoot: __dirname 
  });
} catch (error) {
  // NativeWind not available, use default config
  console.warn("NativeWind metro plugin not available, using default config:", error.message);
}

module.exports = config;

