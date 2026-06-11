const { withAppBuildGradle } = require("expo/config-plugins");

/**
 * Enables optional local release signing via android/keystore.properties.
 * Falls back to the debug keystore when the file is absent (local dev only).
 */
function withAndroidLocalSigning(config) {
  return withAppBuildGradle(config, (gradleConfig) => {
    let contents = gradleConfig.modResults.contents;

    if (contents.includes("keystorePropertiesFile")) {
      return gradleConfig;
    }

    const keystoreLoader = `
def keystorePropertiesFile = rootProject.file("keystore.properties")
def keystoreProperties = new Properties()
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}
`;

    contents = contents.replace(/android\s*\{/, `${keystoreLoader}\nandroid {`);

    contents = contents.replace(
      /signingConfigs\s*\{\s*\n\s*debug\s*\{/,
      `signingConfigs {
        release {
            if (keystorePropertiesFile.exists()) {
                storeFile file(keystoreProperties['storeFile'])
                storePassword keystoreProperties['storePassword']
                keyAlias keystoreProperties['keyAlias']
                keyPassword keystoreProperties['keyPassword']
            }
        }
        debug {`,
    );

    contents = contents.replace(
      /release\s*\{\s*\n\s*\/\/ Caution! In production[^\n]*\n\s*\/\/ see[^\n]*\n\s*signingConfig signingConfigs\.debug/,
      `release {
            // Caution! In production, you need to generate your own keystore file.
            // see https://reactnative.dev/docs/signed-apk-android.
            signingConfig keystorePropertiesFile.exists() ? signingConfigs.release : signingConfigs.debug`,
    );

    gradleConfig.modResults.contents = contents;
    return gradleConfig;
  });
}

module.exports = withAndroidLocalSigning;
