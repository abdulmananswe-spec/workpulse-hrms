const { withAppBuildGradle } = require("expo/config-plugins");

/**
 * Expo config plugin to disable strict release linting (checkReleaseBuilds & abortOnError)
 * in the generated Android Gradle configuration. This prevents third-party library
 * lint failures from halting and hanging the release APK build.
 */
function withDisableLint(config) {
  return withAppBuildGradle(config, (gradleConfig) => {
    let contents = gradleConfig.modResults.contents;

    if (contents.includes("lintOptions")) {
      return gradleConfig;
    }

    const lintConfig = `
    lintOptions {
        checkReleaseBuilds false
        abortOnError false
    }
`;

    // Insert lintOptions at the beginning of the android block
    contents = contents.replace(/android\s*\{/, `android {\n${lintConfig}`);

    gradleConfig.modResults.contents = contents;
    return gradleConfig;
  });
}

module.exports = withDisableLint;
