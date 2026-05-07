import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.e925ee8a2efe44bcbe695472e985ad70',
  appName: 'clever-career-catapult',
  webDir: 'dist',
  server: {
    url: 'https://e925ee8a-2efe-44bc-be69-5472e985ad70.lovableproject.com?forceHideBadge=true',
    cleartext: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#1a1a2e',
      showSpinner: false,
      splashImmersive: true,
      splashFullScreen: true,
    },
  },
};

export default config;
