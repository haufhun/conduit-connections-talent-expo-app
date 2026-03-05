const IS_DEV = process.env.APP_VARIANT === "development";
const IS_PREVIEW = process.env.APP_VARIANT === "preview";

let iosBundleId;
let androidPackageName;
let appName;

if (IS_DEV) {
  iosBundleId = "com.conduitconnections.talent.ios.dev";
  androidPackageName = "com.conduitconnections.talent.android.dev";
  appName = "Conduit (Dev)";
} else if (IS_PREVIEW) {
  iosBundleId = "com.conduitconnections.talent.ios.preview";
  androidPackageName = "com.conduitconnections.talent.android.preview";
  appName = "Conduit (Preview)";
} else {
  iosBundleId = "com.conduitconnections.talent.ios";
  androidPackageName = "com.conduitconnections.talent.android";
  appName = "Conduit";
}

//////////////////////////////////////////////////////////////////////////////////////////
// Uncomment the below section before running npx expo prebuild --platform ios
// ⬇️ Uncomment this below
//////////////////////////////////////////////////////////////////////////////////////////
// iosBundleId = 'com.conduitconnections.talent.ios.dev';
// androidPackageName = 'com.conduitconnections.talent.android.dev';
// appName = 'Invictus Team (Dev)';
// firebaseIosConfig = './firebase/GoogleService-Info-Dev.plist';
// firebaseAndroidConfig = './firebase/google-services-dev.json';
//////////////////////////////////////////////////////////////////////////////////////////
// ⬆️ Uncomment this above
//////////////////////////////////////////////////////////////////////////////////////////

// so, urls should be in one of three formats...
// com.conduitconnections.talent.{platform}          (PROD)
// com.conduitconnections.talent.{platform}.preview  (PREVIEW)
// com.conduitconnections.talent.{platform}.dev      (DEV)

export default {
  expo: {
    name: appName,
    slug: "conduit-connections-talent-expo-app",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./src/assets/images/conduit-logo-1024.png",
    scheme: appName.toLowerCase().replace(/\s+/g, ""),
    userInterfaceStyle: "light",
    owner: "haufhun",
    newArchEnabled: true,
    ios: {
      bundleIdentifier: iosBundleId,
      // buildNumber: '0', // Don't need this anymore due to auto-incrementing build numbers with EAS
      supportsTablet: true,
      infoPlist: {
        NSCameraUsageDescription:
          "Conduit uses your camera so you can take profile and portfolio photos directly in the app, for example when updating your profile or adding a skill sample.",
      },
      config: {
        usesNonExemptEncryption: false,
      },
    },
    android: {
      package: androidPackageName,
      // versionCode: 12,
      // adaptiveIcon: { // Don't have this in VI app. Do we need it here?
      //   foregroundImage: "./src/assets/images/adaptive-icon.png",
      //   backgroundColor: "#ffffff",
      // },
      edgeToEdgeEnabled: true,
      permissions: [
        "android.permission.RECORD_AUDIO",
        "android.permission.POST_NOTIFICATIONS",
      ],
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./src/assets/images/favicon-32x32.png",
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./src/assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
        },
      ],
      "expo-secure-store",
      [
        "expo-image-picker",
        {
          photosPermission:
            "Conduit accesses your photo library so you can select profile and portfolio images, for example when updating your profile or adding a skill sample.",
          cameraPermission:
            "Conduit accesses your camera so you can take profile and portfolio photos directly in the app, for example when updating your profile or adding a skill sample.",
        },
      ],
      [
        "expo-notifications",
        {
          icon: "./src/assets/images/conduit-logo-1024.png",
          color: "#ffffff",
          defaultChannel: "default",
          enableBackgroundRemoteNotifications: false,
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      router: {},
      eas: {
        projectId: "bb22565d-db20-4808-aea0-66bc0f70ed10",
      },
    },
    runtimeVersion: {
      policy: "appVersion",
    },
    updates: {
      url: "https://u.expo.dev/bb22565d-db20-4808-aea0-66bc0f70ed10",
      enabled: true,
      checkAutomatically: "ON_LOAD",
      fallbackToCacheTimeout: 250, // See if this is a good value that actually gets the update downloaded in enough time
    },
  },
};
