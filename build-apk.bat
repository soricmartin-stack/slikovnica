@echo off
REM StoryTime Android APK Builder
REM Run this script to build the APK

echo ============================================
echo   StoryTime - Android APK Builder
echo ============================================
echo.

REM Check if Java is installed
java -version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Java is not installed!
    echo.
    echo Please install Java first:
    echo 1. Download: https://adoptium.net/temurin/releases/?version=17
    echo 2. Run the installer
    echo 3. Restart this script
    echo.
    pause
    exit /b 1
)

echo [OK] Java is installed

REM Check if Android SDK is installed
if not exist "%ANDROID_HOME%\platforms" (
    echo [ERROR] Android SDK is not installed!
    echo.
    echo Please install Android Studio:
    echo 1. Download: https://developer.android.com/studio
    echo 2. Run the installer (default settings)
    echo 3. Let it install SDK automatically
    echo 4. Restart this script
    echo.
    pause
    exit /b 1
)

echo [OK] Android SDK is found

REM Navigate to project
cd /d "%~dp0android"

echo.
echo Building APK...
echo Please wait...
echo.

REM Build the release APK
gradlew.bat assembleRelease

if exist "app\build\outputs\apk\release\app-release.apk" (
    echo.
    echo ============================================
    echo [SUCCESS] APK Built Successfully!
    echo ============================================
    echo.
    echo APK Location:
    echo %~dp0android\app\build\outputs\apk\release\app-release.apk
    echo.
    echo You can now install this APK on your phone!
    echo.
    pause
) else (
    echo.
    echo [ERROR] Build failed. Please check errors above.
    pause
    exit /b 1
)
