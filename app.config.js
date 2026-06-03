const baseConfig = require('./app.json');

module.exports = {
  expo: {
    ...baseConfig.expo,
    plugins: [
      ['expo-build-properties', { android: { allowBackup: false } }],
    ],
  },
};
