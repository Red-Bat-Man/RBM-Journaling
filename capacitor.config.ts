import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.rbmjournal.app',
  appName: 'RBM Journal',
  webDir: 'dist/public',
  server: {
    androidScheme: 'https',
    url: 'https://your-journal-backend-api.replit.app', // Replace with your actual deployed backend URL
    cleartext: true
  },
  plugins: {
    // Add any plugin configurations here
  }
};

export default config;