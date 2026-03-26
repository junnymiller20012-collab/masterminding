const { withProjectBuildGradle } = require('@expo/config-plugins');

const OPT_IN_BLOCK = `
subprojects {
    tasks.withType(org.jetbrains.kotlin.gradle.tasks.KotlinCompile).configureEach {
        kotlinOptions {
            freeCompilerArgs += ["-opt-in=kotlin.RequiresOptIn", "-opt-in=kotlin.ExperimentalStdlibApi"]
        }
    }
}
`;

module.exports = function withKotlinOptIn(config) {
  return withProjectBuildGradle(config, (config) => {
    if (!config.modResults.contents.includes('opt-in=kotlin.RequiresOptIn')) {
      config.modResults.contents += OPT_IN_BLOCK;
    }
    return config;
  });
};
