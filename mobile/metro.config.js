const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, "..");

const config = getDefaultConfig(projectRoot);

// Watch the shared convex folder outside the mobile directory
config.watchFolders = [monorepoRoot];

// Resolve @convex/* imports to the shared convex directory
const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName.startsWith("@convex/")) {
    const subPath = moduleName.replace("@convex/", "");
    return {
      filePath: path.resolve(monorepoRoot, "convex", subPath + ".js"),
      type: "sourceFile",
    };
  }
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
