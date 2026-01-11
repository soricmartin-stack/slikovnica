# StoryTime Android App - Build Instructions

This guide provides complete instructions to build the StoryTime children's picture book app for Android devices.

## Prerequisites

### 1. Java Development Kit (JDK)
```bash
# Install OpenJDK 17 (recommended for Android development)
# macOS
brew install openjdk@17

# Ubuntu/Debian
sudo apt install openjdk-17-jdk

# Windows
# Download from https://adoptium.net/temurin/releases/?version=17
```

Set JAVA_HOME:
```bash
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64  # Linux/Mac
# or
set JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-17.0.9.9-hotspot  # Windows
```

### 2. Android Studio & SDK
1. Download Android Studio from https://developer.android.com/studio
2. Install with default settings
3. Open Android Studio and install:
   - Android SDK (API 33 or higher)
   - Build Tools (latest version)
   - Platform Tools

Set ANDROID_HOME:
```bash
export ANDROID_HOME=$HOME/Android/Sdk  # Linux/Mac
# or
set ANDROID_HOME=C:\Users\%USERNAME%\AppData\Local\Android\Sdk  # Windows
```

Add to PATH:
```bash
export PATH=$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/cmdline-tools/latest/bin
```

## Project Setup

### 1. Navigate to Project
```bash
cd /workspace/slikovnica
```

### 2. Build the Web App
```bash
# Install dependencies (if not already installed)
npm install

# Build for production
npm run build
```

### 3. Prepare Android Assets
The web build output (`dist/`) will be used by the Android app.

### 4. Open in Android Studio
```bash
npx cap open android
```

Or manually open: `android/` folder in Android Studio

## Building the APK

### Method 1: Using Android Studio GUI

1. **Open the project** in Android Studio
2. **Build > Generate Signed Bundle / APK**
3. **Choose APK** (not Android App Bundle for direct installation)
4. **Create or use existing keystore**:
   - Click "Create new..."
   - Key store path: `android/release-keystore.jks`
   - Password: `storytime123`
   - Key alias: `storytime`
   - Key password: `storytime123`
5. **Select Build Variant**: `release`
6. **Click Finish**

### Method 2: Using Command Line

```bash
cd android

# Build debug APK
./gradlew assembleDebug

# Build release APK
./gradlew assembleRelease

# APK will be at: android/app/build/outputs/apk/release/app-release.apk
```

## Installing on Device

### Enable Developer Options
1. Go to Settings > About Phone
2. Tap "Build Number" 7 times
3. Enable USB Debugging in Settings > Developer Options

### Install via USB
```bash
# Connect device via USB and authorize
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

### Install Release APK
```bash
adb install android/app/build/outputs/apk/release/app-release.apk
```

## Features Implemented

### 1. WebView Container
- Full-screen WebView for React app
- Hardware-accelerated rendering
- Offline caching enabled
- Custom user agent for analytics

### 2. Splash Screen
- Colored background matching app theme
- Loading spinner
- Smooth transition to app

### 3. Network Monitoring
- Detects online/offline status
- Automatic offline mode handling
- Background sync support

### 4. Safe Area Support
- Respects notches and gesture navigation
- Proper padding for modern phones

### 5. Keep Screen On
- Prevents screen from turning off while reading

## App Configuration

### Update App Name
Edit `android/app/src/main/res/values/strings.xml`:
```xml
<string name="app_name">StoryTime</string>
```

### Update Package Name
Edit `capacitor.config.json`:
```json
{
  "appId": "com.yourpackage.app"
}
```

### Update Colors
Edit `android/app/src/main/res/values/colors.xml`:
```xml
<color name="primary">#FF6B6B</color>
<color name="background">#F7F9FC</color>
```

## Firebase Setup

### 1. Add google-services.json
1. Go to Firebase Console: https://console.firebase.google.com
2. Select your project (storytime-cea95)
3. Add Android app with package name: `com.storytime.app`
4. Download `google-services.json`
5. Place it at: `android/app/google-services.json`

### 2. Enable Firebase Features
The app will automatically use:
- Firestore for cloud storage
- Analytics for usage tracking

## Troubleshooting

### WebView Not Loading
1. Check if `dist/` folder exists
2. Verify `file:///android_asset/index.html` is accessible
3. Check Logcat for errors: `adb logcat`

### App Crashes on Launch
1. Enable USB debugging
2. Check logs: `adb logcat | grep -i "android.app"`
3. Verify minimum SDK (API 22+) is supported

### White Screen After Splash
1. Check JavaScript errors in console
2. Verify all assets are in `dist/`
3. Check network security config

### Build Errors
1. Clean project: `./gradlew clean`
2. Invalidate caches: File > Invalidate Caches
3. Update dependencies

## Testing Checklist

- [ ] App installs successfully
- [ ] Splash screen appears
- [ ] App loads without errors
- [ ] Books display correctly
- [ ] Creating books works
- [ ] Language switching works
- [ ] Offline mode works
- [ ] Touch controls respond
- [ ] No white flash on navigation

## Publishing to Play Store

### 1. Prepare Store Listing
- App icon (512x512 PNG)
- Feature graphics (1024x500 PNG)
- Screenshots (multiple sizes)
- Description and keywords

### 2. Create Release Build
```bash
./gradlew bundleRelease
# Creates: android/app/build/outputs/bundle/release/app-release.aab
```

### 3. Upload to Play Console
1. Go to Google Play Console
2. Create new release
3. Upload AAB file
4. Fill store listing
5. Submit for review

## File Structure

```
slikovnica/
├── android/
│   ├── app/
│   │   ├── src/main/
│   │   │   ├── java/com/storytime/app/
│   │   │   │   ├── MainActivity.java
│   │   │   │   └── MainApplication.java
│   │   │   ├── res/
│   │   │   │   ├── layout/activity_main.xml
│   │   │   │   ├── values/strings.xml, colors.xml, themes.xml
│   │   │   │   ├── xml/network_security_config.xml
│   │   │   │   └── drawable/
│   │   │   └── AndroidManifest.xml
│   │   ├── build.gradle
│   │   └── proguard-rules.pro
│   ├── build.gradle
│   ├── settings.gradle
│   └── gradle/wrapper/
├── dist/                    # Web build output
├── src/                     # React source code
├── package.json
└── capacitor.config.json
```

## Support

For issues:
1. Check Android Logcat: `adb logcat`
2. Open Chrome DevTools: chrome://inspect
3. Enable WebView debugging in app settings
