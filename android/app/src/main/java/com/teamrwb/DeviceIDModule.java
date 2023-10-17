// DeviceIDModule.java

package com.teamrwb;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import android.provider.Settings;
import com.facebook.react.bridge.Callback;

public class DeviceIDModule extends ReactContextBaseJavaModule {

  public DeviceIDModule(ReactApplicationContext reactContext) {
    super(reactContext);
  }

  @Override
  public String getName() {
    return "DeviceID";
  }

 @ReactMethod
    public String getDeviceIDString(
        Callback errorCallback,
        Callback successCallback
            ){
      String androidID;
      try {
          androidID = Settings.Secure.getString(getReactApplicationContext().getContentResolver(), Settings.Secure.ANDROID_ID);
          successCallback.invoke(androidID);
      } catch (Throwable e){
          androidID = "In the catch";
          errorCallback.invoke(androidID);
      }
     return androidID;
    }
}
