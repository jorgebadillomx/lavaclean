const baseConfig = require('./app.json');

module.exports = {
  expo: {
    ...baseConfig.expo,
    updates: {
      url: 'https://u.expo.dev/80847ecf-5324-4947-95f0-da696f1fa8df',
    },
    extra: {
      ...baseConfig.expo?.extra,
      eas: {
        projectId: '80847ecf-5324-4947-95f0-da696f1fa8df',
      },
      sentryDsn: process.env.SENTRY_DSN ?? '',
    },
    plugins: [
      ['expo-build-properties', { android: { allowBackup: false, minSdkVersion: 24 } }],
      ['expo-splash-screen', { image: './assets/images/splash.png', resizeMode: 'contain', backgroundColor: '#ffffff' }],
      '@sentry/react-native/expo',
    ],
  },
};
