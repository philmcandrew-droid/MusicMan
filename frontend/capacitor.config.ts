import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.philmcandrew.musicman',
  appName: 'MusicMan',
  webDir: '../New UI/out',
  android: {
    allowMixedContent: false,
    webContentsDebuggingEnabled: true,
    initialFocus: false,
  },
  server: {
    androidScheme: 'https',
  },
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
  },
};

export default config;