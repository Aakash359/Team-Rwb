package com.teamrwb;

import android.app.Application;
import android.content.Context;
import com.facebook.react.PackageList;
import com.facebook.react.ReactApplication;
import com.reactnativecommunity.webview.RNCWebViewPackage;
import com.horcrux.svg.SvgPackage;
import com.swmansion.rnscreens.RNScreensPackage;
import com.th3rdwave.safeareacontext.SafeAreaContextPackage;
import com.swmansion.reanimated.ReanimatedPackage;
import com.dieam.reactnativepushnotification.ReactNativePushNotificationPackage;
import com.reactnativecommunity.rnpermissions.RNPermissionsPackage;
import com.airbnb.android.react.maps.MapsPackage;
import com.oblador.keychain.KeychainPackage;
import fr.bamlab.rnimageresizer.ImageResizerPackage;
import com.swmansion.gesturehandler.RNGestureHandlerPackage;
import com.facebook.reactnative.androidsdk.FBSDKPackage;
import org.reactnative.camera.RNCameraPackage;
import com.vonovak.AddCalendarEventPackage;
import org.reactnative.maskedview.RNCMaskedViewPackage;
import com.reactnativegooglesignin.RNGoogleSigninPackage;
import com.reactnativecommunity.geolocation.GeolocationPackage;
import com.reactcommunity.rndatetimepicker.RNDateTimePickerPackage;
import com.reactnativecommunity.cameraroll.CameraRollPackage;
import android.text.TextUtils;
import java.util.Random;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.FacebookSdk;
import com.facebook.soloader.SoLoader;
import java.lang.reflect.InvocationTargetException;
import java.util.List;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.app.PendingIntent;
import android.view.ViewGroup;
import android.util.Log;
import android.net.Uri;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import org.jetbrains.annotations.NotNull;
import com.salesforce.marketingcloud.InitializationStatus;
import com.salesforce.marketingcloud.MCLogListener;
import com.salesforce.marketingcloud.MarketingCloudConfig;
import com.salesforce.marketingcloud.MarketingCloudSdk;
import com.salesforce.marketingcloud.notifications.NotificationManager;
import com.salesforce.marketingcloud.notifications.NotificationMessage;
import com.salesforce.marketingcloud.UrlHandler;
import com.salesforce.marketingcloud.notifications.NotificationCustomizationOptions;
import android.content.BroadcastReceiver;
import android.content.Intent;
import com.teamrwb.CustomDeviceIDPackage;
import com.teamrwb.MainActivity;
//import com.teamrwb.newarchitecture.MainApplicationReactNativeHost;
import com.facebook.react.config.ReactFeatureFlags;

public class MainApplication extends Application implements ReactApplication, MarketingCloudSdk.InitializationListener, UrlHandler {

  // private static CallbackManager mCallbackManager = CallbackManager.Factory.create();

  // protected static CallbackManager getCallbackManager() {
  //   return mCallbackManager;
  // }

  private final ReactNativeHost mReactNativeHost =
      new ReactNativeHost(this) {
        @Override
        public boolean getUseDeveloperSupport() {
          return BuildConfig.DEBUG;
        }

        @Override
        protected List<ReactPackage> getPackages() {
          @SuppressWarnings("UnnecessaryLocalVariable")
          List<ReactPackage> packages = new PackageList(this).getPackages();
          // Packages that cannot be autolinked yet can be added manually here, for example:
          packages.add(new CustomDeviceIDPackage());
          return packages;
        }

        @Override
        protected String getJSMainModuleName() {
          return "index";
        }
      };

//    private final ReactNativeHost mNewArchitectureNativeHost =
//            new MainApplicationReactNativeHost(this);

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    // If you opted-in for the New Architecture, we enable the TurboModule system
    ReactFeatureFlags.useTurboModules = false;
    MarketingCloudSdk.setLogLevel(MCLogListener.VERBOSE);
    MarketingCloudSdk.setLogListener(new MCLogListener() {
            @Override
            public void out(int i, @NotNull String s, @NotNull String s1, @org.jetbrains.annotations.Nullable Throwable throwable) {
                Log.d("MarketingCloud", s + ": " + s1);
            }
    });

    MarketingCloudSdk.init(this, MarketingCloudConfig.builder()
                .setApplicationId("d9b0a738-bafb-46f3-ae4a-13dad3bda775")
                .setAccessToken("TV5a28KLKEej11H7NsUOoKAc")
                .setDelayRegistrationUntilContactKeyIsSet(true)
                .setUrlHandler(this)
                .setAnalyticsEnabled(true)
                .setMid("100023738")
                .setSenderId("248550484407") //marketing cloud says not calling this might help when implementing FCM and marketing cloud.
                .setMarketingCloudServerUrl("https://mc3qx2l8dqdxdhhq0h-9hdd3zqym.device.marketingcloudapis.com/")
                .setNotificationCustomizationOptions(
                    NotificationCustomizationOptions.create(R.mipmap.ic_notification,
                            new NotificationManager.NotificationLaunchIntentProvider() {
                                @Nullable @Override
                                public PendingIntent getNotificationPendingIntent(@NonNull Context context,
                                                                                  @NonNull NotificationMessage notificationMessage) {
                                    Log.d("MarketingCloud", "getNotificationPendingIntent");
                                    int requestCode = new Random().nextInt();
                                    String url = notificationMessage.url();
                                    Log.d("MarketingCloud", "url:"+url);
                                    PendingIntent pendingIntent;
                                    if (TextUtils.isEmpty(url)) {
                                        pendingIntent = PendingIntent.getActivity(
                                                context,
                                                requestCode,
                                                new Intent(context, MainActivity.class),
                                                PendingIntent.FLAG_UPDATE_CURRENT
                                        );
                                    } else {
                                        Intent foreground = new Intent(context,MainActivity.class);
                                        foreground.putExtra("url",url);
                                        pendingIntent = PendingIntent.getActivity(
                                                context,
                                                requestCode,
                                                foreground,
                                                PendingIntent.FLAG_UPDATE_CURRENT
                                        );
                                    }
                                    return NotificationManager.redirectIntentForAnalytics(context, pendingIntent, notificationMessage, true);
                                }
                            }, new NotificationManager.NotificationChannelIdProvider() {
                                @NonNull @Override public String getNotificationChannelId(@NonNull Context context,
                                                                                          @NonNull NotificationMessage notificationMessage) {
                                        return NotificationManager.createDefaultNotificationChannel(context);
                                }
                            }))
                .build(this), this);

    MarketingCloudSdk.getInstance().getNotificationManager().setShouldShowNotificationListener(new NotificationManager.ShouldShowNotificationListener() {
        @Override
        public boolean shouldShowNotification(@NonNull NotificationMessage notificationMessage) {
            return true;
        }
    });
    FacebookSdk.sdkInitialize(getApplicationContext());
    SoLoader.init(this, /* native exopackage */ false);
    // initializeFlipper(this); // Remove this line if you don't want Flipper enabled
  }



    //////////////////////////////////////////////
    // Salesforce Marketing Cloud API callbacks
    //////////////////////////////////////////////

    @Override
    public void complete(InitializationStatus status) {
        if (status.status()==InitializationStatus.Status.COMPLETED_WITH_DEGRADED_FUNCTIONALITY) {
            Log.d("MarketingCloud", "degraded");
        } else if (status.status()==InitializationStatus.Status.SUCCESS) {
            Log.d("MarketingCloud", "success");
        } else {
            Log.d("MarketingCloud", "failed");
        }
    }

    @Nullable
    public PendingIntent handleUrl(@NonNull Context context, @NonNull String url, @NonNull String urlSource) {
        Log.d("MarketingCloud", "handleUrl");
        return MainActivity.getInstance().handleUrl(context,url,urlSource);
    }

  /**
   * Loads Flipper in React Native templates.
   *
   * @param context
   */
  private static void initializeFlipper(Context context) {
    if (BuildConfig.DEBUG) {
      try {
        /*
         We use reflection here to pick up the class that initializes Flipper,
        since Flipper library is not available in release mode
        */
        Class<?> aClass = Class.forName("com.facebook.flipper.ReactNativeFlipper");
        aClass.getMethod("initializeFlipper", Context.class).invoke(null, context);
      } catch (ClassNotFoundException e) {
        e.printStackTrace();
      } catch (NoSuchMethodException e) {
        e.printStackTrace();
      } catch (IllegalAccessException e) {
        e.printStackTrace();
      } catch (InvocationTargetException e) {
        e.printStackTrace();
      }
    }
  }
}
