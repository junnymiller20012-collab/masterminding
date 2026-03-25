const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

// Resolve @convex/_generated to the shared convex directory
config.resolver.extraNodeModules = {
  "@convex": path.resolve(__dirname, "../convex"),
};

module.exports = config;
