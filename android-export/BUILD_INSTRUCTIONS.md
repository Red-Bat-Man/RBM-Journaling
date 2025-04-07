# RBM Journal Android Build Instructions

This package contains everything you need to build the RBM Journal Android app on your local machine.

## Prerequisites

1. Make sure you have the following installed:
   - Node.js (v18+)
   - Java JDK 11+
   - Android Studio with Android SDK installed

2. Set up environment variables:
   - JAVA_HOME pointing to your JDK installation
   - ANDROID_SDK_ROOT pointing to your Android SDK installation

## Build Steps

1. Install required Node.js dependencies:
   ```
   npm install
   ```

2. Update the server URL in capacitor.config.ts:
   - Replace the placeholder URL with your actual deployed backend URL
   - Example: `url: 'https://your-deployed-journal-app.replit.app'`

3. Build the Android APK:
   ```
   cd android
   ./gradlew assembleDebug
   ```

4. The APK will be located at:
   ```
   android/app/build/outputs/apk/debug/app-debug.apk
   ```

5. Install on your device:
   - Connect your Android device via USB
   - Enable USB debugging on your device
   - Run: `adb install app-debug.apk`

## Troubleshooting

- If you encounter any build errors, make sure you have the correct Android SDK version installed
- For network issues, check that your backend URL is correct and the server is running
- Make sure to allow cleartext traffic if your backend doesn't support HTTPS

