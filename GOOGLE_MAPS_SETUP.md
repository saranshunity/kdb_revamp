# Google Maps API Setup Guide

## Getting Your Google Maps API Key

### Step 1: Create a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - **Maps SDK for Android**
   - **Maps SDK for iOS**
   - **Places API** (optional, for enhanced features)

### Step 2: Create API Key
1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **API Key**
3. Copy the generated API key

### Step 3: Configure API Key Restrictions (Recommended)
1. Click on your API key to edit it
2. Under **Application restrictions**:
   - For Android: Add your package name `com.kdb_revamp_code` and SHA-1 fingerprint
   - For iOS: Add your bundle ID (from your Apple Developer account)
3. Under **API restrictions**: Restrict to Maps SDK for Android/iOS

### Step 4: Add API Key to Your App

#### For iOS (Info.plist):
Replace `YOUR_GOOGLE_MAPS_API_KEY_HERE` in:
```
ios/kdb_revamp_code/Info.plist
```

#### For Android (AndroidManifest.xml):
Replace `YOUR_GOOGLE_MAPS_API_KEY_HERE` in:
```
android/app/src/main/AndroidManifest.xml
```

### Step 5: Get SHA-1 Fingerprint for Android
Run this command in your project root:
```bash
cd android && ./gradlew signingReport
```

Look for the SHA1 fingerprint under the `debug` variant.

### Step 6: Rebuild the App
After adding the API key:
```bash
# For Android
npm run android

# For iOS
npm run ios
```

## Important Notes
- Never commit your API key to version control
- Use environment variables for production
- Monitor your API usage in Google Cloud Console
- Set up billing alerts to avoid unexpected charges

## Troubleshooting
- **"API key is missing"**: Ensure the API key is correctly added to both iOS and Android configs
- **"This app is not authorized"**: Check API key restrictions and package name/bundle ID
- **Maps not loading**: Verify the Maps SDK APIs are enabled in Google Cloud Console
