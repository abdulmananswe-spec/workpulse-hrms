const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, "..");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(projectRoot);

config.watchFolders = [monorepoRoot];

const defaultResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === "ws") {
    return { type: "empty" };
  }

  if (moduleName === "@shared/leave-validation") {
    return {
      type: "sourceFile",
      filePath: path.resolve(monorepoRoot, "shared/leave-validation/index.ts"),
    };
  }

  if (moduleName === "@shared/duty-hours") {
    return {
      type: "sourceFile",
      filePath: path.resolve(monorepoRoot, "shared/duty-hours/index.ts"),
    };
  }

  if (defaultResolveRequest) {
    return defaultResolveRequest(context, moduleName, platform);
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: "./global.css" });
