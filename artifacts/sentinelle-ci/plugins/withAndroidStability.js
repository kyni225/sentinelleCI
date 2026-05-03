const { withAndroidManifest } = require("@expo/config-plugins");

/**
 * Config plugin that improves Android activity stability when using
 * launchCameraAsync / launchImageLibraryAsync. Without these settings,
 * Android may destroy the React Native activity while the camera app is
 * open, causing the app to restart from the root screen instead of
 * returning to the previous page.
 *
 * - android:largeHeap="true"  → gives the app more memory so the system
 *   is less likely to kill it in the background.
 * - android:alwaysRetainTaskState="true" → preserves the task back-stack
 *   so the user returns to the same screen after the camera closes.
 */
function withAndroidStability(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults;

    // --- <application> level ---
    const application = manifest.manifest.application?.[0];
    if (application) {
      application.$ = application.$ || {};
      application.$["android:largeHeap"] = "true";
    }

    // --- main <activity> level ---
    const activity = application?.activity?.[0];
    if (activity) {
      activity.$ = activity.$ || {};
      activity.$["android:alwaysRetainTaskState"] = "true";

      // Ensure configChanges includes orientation & screenSize so the
      // activity is NOT recreated on rotation while the camera is open.
      const existing = activity.$["android:configChanges"] || "";
      const required = [
        "keyboard",
        "keyboardHidden",
        "orientation",
        "screenSize",
        "smallestScreenSize",
        "layoutDirection",
        "screenLayout",
        "uiMode",
      ];
      const parts = new Set([
        ...existing.split("|").filter(Boolean),
        ...required,
      ]);
      activity.$["android:configChanges"] = [...parts].join("|");
    }

    return config;
  });
}

module.exports = withAndroidStability;
