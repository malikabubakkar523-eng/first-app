import type { CapacitorConfig } from '@capacitor/cli';

/**
 * VELOCE Capacitor Configuration for iOS & Android App Store Deployment
 */
const config: CapacitorConfig = {
  appId: 'com.veloce.footwear',
  appName: 'VELOCE',
  webDir: 'public',
  server: {
    // Configure production URL when pointing native app directly to hosted backend
    url: process.env.CAPACITOR_SERVER_URL || undefined,
    androidScheme: 'https',
    iosScheme: 'https',
    cleartext: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1800,
      launchAutoHide: true,
      backgroundColor: '#09090b',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#09090b',
    },
  },
  ios: {
    contentInset: 'always',
    scheme: 'VELOCE',
    preferredContentMode: 'mobile',
  },
  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
  },
};

export default config;
