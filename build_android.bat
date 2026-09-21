@echo off
set "JAVA_HOME=C:\Users\user\AppData\Local\jdk-21"
set "ANDROID_HOME=C:\Users\user\AppData\Local\Android\Sdk"
set "ANDROID_SDK_ROOT=C:\Users\user\AppData\Local\Android\Sdk"
set "PATH=%JAVA_HOME%\bin;%ANDROID_HOME%\cmdline-tools\latest\bin;%ANDROID_HOME%\platform-tools;%PATH%"

echo ==============================================
echo [1/2] Building Web Assets and Syncing Capacitor...
echo ==============================================
cd /d "%~dp0"
call npm run build
call npx cap sync android

echo ==============================================
echo [2/2] Compiling Android APK with Gradle...
echo ==============================================
cd /d "%~dp0android"
call gradlew.bat assembleDebug

if %ERRORLEVEL% EQU 0 (
    echo ==============================================
    echo BUILD SUCCESS! APK generated at:
    echo %~dp0android\app\build\outputs\apk\debug\app-debug.apk
    echo ==============================================
) else (
    echo ==============================================
    echo BUILD FAILED! Check the error messages above.
    echo ==============================================
)
