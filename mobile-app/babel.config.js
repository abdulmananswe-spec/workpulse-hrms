module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      // nativewind/babel (via react-native-css-interop) already adds
      // react-native-worklets/plugin — disable duplicate from preset-expo.
      [
        "babel-preset-expo",
        {
          jsxImportSource: "nativewind",
          worklets: false,
          reanimated: false,
        },
      ],
      "nativewind/babel",
    ],
  };
};
