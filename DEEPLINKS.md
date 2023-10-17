Deep linking requires Native Code for both android and iOS, as well as JavaScript code.

# Android

In AndroidManifest.XML, add a new <data />. Copy and pasting a previous one and replacing the `android:pathPrefix` should be sufficient.
Make sure to add this to the production and staging intent sections.

EX:
  <data
      android:host="members.teamrwb.org"
      android:pathPrefix="/groups"
      android:scheme="https" />

The new data intent can be tested with the following ADB command:

`adb shell am start -W -a android.intent.action.VIEW -d "https://members.teamrwb.org/groups"`

Note that links on android do not always prompt this. For example, pasting the URL directly
into the browser does nothing, nor does clicking the link in telegram (telegram link works for iOS).
Clicking on the link on an email does work.

# iOS

Add the new path to apple-app-site-association.

## Push Notifications

Push notifications get handled in MainActivity.java in the `PendingIntent` function

# iOS

Add the path to apple-app-site-association and upload the file to the website.

NOTE: After doing this uninstall the app.
https://stackoverflow.com/questions/45504467/i-added-a-new-path-to-apple-app-site-association-file-but-still-doesnt-work?answertab=active#tab-top

## Push Notifications

Add the path to the conditional in `handleUrl` in AppDelegate.m.


# JavaScript

in App.js, add the `path` field to the route, and include the name of what should be expected.
EX: `path: 'events/:id'`

The value after the colon is what can be retrieved.
EX: `const eventID = getParam('id', null);` in EventView.js
Then set up the code for how to handle what has been sent.

NOTE: The Linking library for react native does not need to be frequently used. One case of using is handling links when already on a tab.
For example, if I am on the groups tab and background to open a link to a specific group, I will want to use the Linking library on the groups tab to enable navigation. Look at GroupTab.js for more information.
