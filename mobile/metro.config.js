const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;

const config = getDefaultConfig(projectRoot);

// Resolve @convex/* imports to the local convex directory bundled with the app
const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName.startsWith("@convex/")) {
    const subPath = moduleName.replace("@convex/", "");
    return {
      filePath: path.resolve(projectRoot, "convex", subPath + ".js"),
      type: "sourceFile",
    };
  }
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
