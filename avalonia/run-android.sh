#!/usr/bin/env bash
#
# Build the KoboGg Avalonia Android app and launch it on a connected device.
#
#   ./run-android.sh            # Release build  -> API base URL https://kobo.gg
#   ./run-android.sh Debug      # Debug build    -> API base URL http://10.0.2.2:8080
#
# The API base URL is chosen at COMPILE TIME (KoboGg/Services/AppConfig.cs):
#   Release -> https://kobo.gg     (use this for a real phone)
#   Debug   -> http://10.0.2.2:8080 (Android emulator -> backend on the host machine;
#                                    a physical phone can't reach 10.0.2.2)
set -euo pipefail

# JDK + Android SDK are installed but not on PATH on this machine, so point the build at them.
export JAVA_HOME=/home/vsaik/tools/jdk-17.0.13+11
export ANDROID_HOME=/home/vsaik/Android/Sdk

ADB="$ANDROID_HOME/platform-tools/adb"
PROJ="$(cd "$(dirname "$0")" && pwd)/KoboGg.Android/KoboGg.Android.csproj"
CONFIG="${1:-Release}"

# Pick the first device that's in the "device" state (skips the header line and any
# offline/unauthorized entries). Your Pixel may appear twice over wireless debugging
# (mDNS + IP) — either entry is the same phone, so the first match is fine.
SERIAL="$("$ADB" devices | awk '$2=="device"{print $1; exit}')"
if [ -z "$SERIAL" ]; then
  echo "No connected device. Plug in over USB, or for wireless debugging run:" >&2
  echo "  $ADB connect <phone-ip>:<port>      # see Settings > Wireless debugging" >&2
  echo "Then re-run this script." >&2
  exit 1
fi

echo ">> $CONFIG build -> deploying to $SERIAL"
dotnet build "$PROJ" -c "$CONFIG" -t:Run -p:AdbTarget="-s $SERIAL"
echo ">> Done. The app should now be open on your phone."
