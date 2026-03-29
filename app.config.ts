import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'AquaPulse',
  slug: 'aquapulse',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'aquapulse',
  userInterfaceStyle: 'light',
  newArchEnabled: true,

  splash: {
    image: './assets/images/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#0EA5E9',
  },

  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.aofnfp.aquapulse',
    infoPlist: {
      SKAdNetworkItems: [
        { SKAdNetworkIdentifier: 'cstr6suwn9.skadnetwork' },
      ],
      NSUserTrackingUsageDescription:
        'This helps us show relevant ads and support the free version of AquaPulse.',
    },
  },

  android: {
    adaptiveIcon: {
      foregroundImage: './assets/images/adaptive-icon.png',
      backgroundColor: '#FFFFFF',
    },
    package: 'com.aofnfp.aquapulse',
    permissions: [
      'android.permission.VIBRATE',
      'android.permission.POST_NOTIFICATIONS',
      'com.google.android.gms.permission.AD_ID',
    ],
  },

  web: {
    favicon: './assets/images/favicon.png',
  },

  plugins: [
    ['expo-router', { origin: 'https://aquapulse.app/' }],
    ['expo-notifications'],
    ['expo-tracking-transparency'],
    [
      'react-native-google-mobile-ads',
      {
        androidAppId:
          process.env.ADMOB_ANDROID_APP_ID ??
          'ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY',
        iosAppId:
          process.env.ADMOB_IOS_APP_ID ??
          'ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY',
      },
    ],
  ],

  experiments: { typedRoutes: true },

  extra: {
    eas: {
      projectId:
        process.env.EAS_PROJECT_ID ?? 'REPLACE_WITH_EAS_PROJECT_ID',
    },
  },

  owner: 'aofnfp',
  runtimeVersion: { policy: 'appVersion' },
  updates: {
    url: `https://u.expo.dev/${process.env.EAS_PROJECT_ID ?? 'REPLACE_WITH_EAS_PROJECT_ID'}`,
  },
});
