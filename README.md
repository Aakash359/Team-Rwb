# Getting Started

Our base JS dependencies are:
- `node` v12.22.0
- `npm` v8.11.0

You can use `nvm` (Node version manager) to install particular `node` and `npm` versions, if desired.

Once `npm` is installed, run `npm install` from `rwb-mobile/TeamRWB` to pull in all libraries and dependencies.
To start the metro bundler, run `npm start`. This will open up a server on tcp:8081 for serving bundled JS source.

If you run into problems with the bundler, try the following in order:
1. `npm start -- --reset-cache`
2. `rm -rf node_modules/ && npm install`

## Getting started (iOS)

If you run into this error when pod installing
[!] Invalid `Podfile` file: 
[!] Invalid `RNReanimated.podspec` file: undefined method `exists?' for File:Class.

go to this file `rwb-mobile/TeamRWB/node_modules/react-native-reanimated/scripts/reanimated_utils.rb` and change `exists` to `exist`

Dependencies:

- xCode v11.x
- `pod` v1.84

Once all npm dependencies are installed with `npm install`, navigate to `ios/` and run:
`pod install`

You will need to do this with every new dependency installed.

To run this project on a simulator, open up `./ios/TeamRWB.xcworkspace` in xCode.
It is very important you **do not** open `./ios/TeamRWB.xcodeproj`.
You'll need to configure your signing with the Team Red White & Blue development team.
Set your active scheme to your favorite iOS simulator device, and click 'run.'
If you encountered build error with missing architectures required by arm64, try:
Add 'arm64' in Build Settings->Architectures->Excluded Architectures->Debug/Release->Any iOS Simulator SDK.

The project will soon be deployed to the simulator.
Do note that some features may not work as intended on the simulator.
Notably, push notifications and local notifications may be broken.

## Getting started (Android)

- Android Studio Chipmunk | 2021.2.1 Patch 2
Build #AI-212.5712.43.2112.8815526, built on July 10, 2022
Runtime version: 11.0.12+0-b1504.28-7817840 x86_64
Non-Bundled Plugins: org.jetbrains.kotlin (212-1.7.10-release-333-AS5457.46)
- Android Gradle Plugin Version 7.0.4
- Gradle Version 7.3.3

If you run into the following error -- or similar -- during gradle sync:
`ERROR: The modules ['@react-native-community_cameraroll', 'react-native-community_cameraroll'] point to the same directory in the file system. Each module must have a unique path.`
In the top-left corner of Android Studio, right click on a single module and select 'Load/Unload Modules...'
Unload all the modules that give this error and re-sync Gradle files.

After this, you may encounter java compiler errors concerning deprecated or removed APIs.
You'll have to install and run Jetify:

`npm install jetifier`
`npx jetify`

If you encounter problems with the your device communicating with the bundler, try:
`adb reverse tcp:8081 tcp:8081`

# Running the App Locally for Development

`npm` has some useful presets here for quick builds to a connected device.
`npm run android` and `npm run ios` will build the app and deploy it to the connected debug device.
Alternatively, you can open the project in an IDE and build debug variants to your device. If this is the case, you may want to run the bundler manually with `npm start`.
Saved changes in `src/` will automatically be re-bundled to the app if developing this way, which allows for extremely fast layout debugging.

On both platforms, shaking the device (or `Command-d` for simulators) will bring up an options menu, where you can allow remote debugging.
React Native has poor support for proper breakpoint-debugging, but there are a variety of ways to work around this.
- `console.log()` will display information in connected debuggers.
- `console.warn()` will add a yellow box to the queue at the bottom of the device screen -- useful for when debuggers are unavailable.
- `console.error()` flashes a full-screen warning.

Additionally, enabling network inspect allows best-in-class network debugging.
The Inspector is also useful for tracking down unintended component layout issues.

The `__DEV__` special variable is set by React Native to be `true` for any debug builds.

# Building for Release and Deploying

This only applies if you're uploading the app to a store for production.
Rarely, you might need to follow some of these steps to observe behavior in production builds.

In order to test push notifications on stage pointed builds, change google-service.json/plist to google-service-prod.json/plist
and remove the -dev from the other service file.

1. Update all build numbers:
  1. `./android/app/build.gradle` (versionCode)
  2. `ios/TeamRWB/Info.plist` (see Useful Commands below)
2. Update all version numbers:
  1. `./package.json`
  2. `./android/app/build.gradle` (versionName)
  3. Info.plist uses `MARKETING_VERSION` for version number in `ios/TeamRWB.xcodeproj/project.pbxproj`. There are TWO spots to update
3. Run the bundle commands below for the desired platform.
4. Select the proper build variant in the IDE you're using.
5. Build the app using the IDE.
  - For xCode, select 'Generic iOS Device' for the target, then Product > Archive
    1. Once archived, Validate the archive
    2. Once validated, upload the archive to the App Store
  - For Android Studio, select Build > Generate Signed Bundle / APK
    1. Select Android App Bundle
    2. Copy key information from `./android/gradle.properties`. Do not export.
      - Note that the key is stored in `/rwb-mobile/TeamRWB/android/app/`, so the full path will be
        `/rwb-mobile/TeamRWB/android/app/rwb-androidrelease-key.keystore`
    3. Select 'Release'
    4. Create the bundle, then find it and upload it to the Google Play Store console.

# Useful Commands

## General

To ensure consistency across developers' contributions, as well as to reduce diff sizes, we will use [Prettier](https://prettier.io/) to auto-format our code.
Make sure to run `npm run fmt` after commiting each change, then amend the commit with the prettified changes.

react-native-gesture-handler is a needed dependency despite not using it directly.
TODO: test using what it offers for smoother presses/navigations or figure out if it can be removed.

### Regenerate APIKeys-obfuscated.js

`./postinstall.sh`
This script obfuscates our API keys file in a deterministic fashion.

## iOS

### Change Build Number
`agvtool new-version -all VERSION-NUM`
VERSION-NUM should be the expected differential revision number the version-change diff creates.
Remember to increment `CFBundleShortVersionString` in Info.plist as well.

### Build iOS bundle
`react-native bundle --entry-file='index.js' --bundle-output='./ios/main.jsbundle' --dev=false --platform='ios' --assets-dest='./ios'`

### Handling Swift Errors

If you end up with 100 some errors, swift may not be properly linked:

Open ios/YourAppName.xcodeproj in Xcode
Right-click on Your App Name in the Project Navigator on the left, and click New File…
Create a single empty Swift file to the project (make sure that Your App Name target is selected when adding)
when Xcode asks, press Create Bridging Header and do not remove Swift file then. re-run your build.

This should fix the problem


## Android

### Build Android Bundle
Create the bundle and remove all duplicate resources by running `npm run build-android`

### Debugging
Run `adb reverse tcp:8081 tcp:8081` (tools might be needed to run this)

### Uploading iOS
When the iOS build is on test flight, answer "Yes" to Encryption and "Yes" to meeting one of the conditions for the compliance checks.

## Release Tagging

After a deploy, tag the current commit as a release.

Use `git tag mobile-vx.y.z`, where x, y, and z are the major, minor and patch versions.
The version should match what's in `package.json`.

Push the tags with `git push --tags`, and pull them with `git pull --tags`.

You can then later search for commits by tag, using `git tag -l "mobile-v2.0.*"`, for example.

# Analytics
For testing analytics update `firebase.native.js` to set collection while in dev.
For iOS, in scheme make sure the `-FIRDebugEnabled` is under the arguments passed on launch under "Run".
For Android, you'll need to run `adb shell setprop debug.firebase.analytics.app com.teamrwb`
It may take a minute or two for the device to show up under the firebase DebugView. If it does not show up, rerun the app.
Google Analytics information does not update until the next day, using the firebase DebugView is the only viable option.

Additionally, make sure you use the -dev google service files. To do this, rename the current ones with a -prod
and remove the -dev from the dev ones. The app looks for the `google-services.json` file specifically.

Shared changes should be made in Analytics.js. Each logging event has its own name and is imported to the needed file.

If a new log event needs to be made, it should copy the format of other log events and create the 
appropriate category if needed.

In addition, when logging an event we want to pass the `previous_view` and any other non-hardcoded value.
There are examples of this in the registration flow for how the value is sent to other screens, how it is retrieved, and how it is passed into the analytics function.
