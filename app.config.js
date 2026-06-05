module.exports = {
  expo: {
    name: 'LavaClean',
    slug: 'lavaclean',
    version: '1.0.0',
    runtimeVersion: {
      policy: 'fingerprint',
    },
    orientation: 'portrait',
    userInterfaceStyle: 'light',
    icon: './assets/images/icon.png',
    android: {
      package: 'com.prototipo0.lavaclean',
      adaptiveIcon: {
        foregroundImage: './assets/images/icon.png',
        backgroundColor: '#ffffff',
      },
    },
    updates: {
      url: 'https://u.expo.dev/80847ecf-5324-4947-95f0-da696f1fa8df',
    },
    extra: {
      eas: {
        projectId: '80847ecf-5324-4947-95f0-da696f1fa8df',
      },
      adminSalt: process.env.ADMIN_SALT,
    },
    plugins: [
      ['expo-build-properties', { android: { allowBackup: false, minSdkVersion: 24 } }],
      ['expo-splash-screen', { image: './assets/images/splash.png', resizeMode: 'contain', backgroundColor: '#ffffff' }],
      ['@sentry/react-native/expo', {
        url: 'https://sentry.io/',
        organization: 'jorgebadillomx',
        project: 'android',
        authToken: process.env.SENTRY_AUTH_TOKEN,
      }],
    ],
  },
};
