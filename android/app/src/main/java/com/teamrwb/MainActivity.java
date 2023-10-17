package com.teamrwb;

import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.net.Uri;
import android.os.Bundle;
import android.util.Log;
import android.view.ViewGroup;
import android.webkit.WebView;
import android.webkit.WebViewClient;


import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.localbroadcastmanager.content.LocalBroadcastManager;

import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.ReactRootView;
import com.google.android.gms.tasks.OnCompleteListener;
import com.google.android.gms.tasks.Task;
import com.google.firebase.iid.FirebaseInstanceId;
import com.google.firebase.iid.InstanceIdResult;
import com.salesforce.marketingcloud.MarketingCloudSdk;
import com.swmansion.gesturehandler.react.RNGestureHandlerEnabledRootView;
import android.os.Handler;
import android.os.Debug;
import org.jetbrains.annotations.NotNull;
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.ReactRootView;


import android.util.Log;

// Push registration
import com.google.android.gms.tasks.OnCompleteListener;
import com.google.android.gms.tasks.Task;
import com.google.firebase.iid.FirebaseInstanceId;
import com.google.firebase.iid.InstanceIdResult;
import androidx.annotation.NonNull;

public class MainActivity extends ReactActivity {
    private static MainActivity instance;
    private WebView mWebView;
    private Boolean initialLaunch;

    private final String TAG = "MainActivity";


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(null);
        Log.d("Firebase", "token "+ FirebaseInstanceId.getInstance().getToken());
        if (FirebaseInstanceId.getInstance().getToken()!=null) {
            MarketingCloudSdk.getInstance().getPushMessageManager().setPushToken(FirebaseInstanceId.getInstance().getToken());
        }
        instance = this;
        initialLaunch = true;
        onNewIntent(getIntent());
    }

    public static MainActivity getInstance() {
        return instance;
    }

    @Override
    public void onNewIntent (Intent intent) {
        super.onNewIntent(intent);
        int delay = 2;
        if (initialLaunch) {
            delay = 6; //longer delay to let the app boot on first launch. work around for a Linking get url == null bug;
        }
        initialLaunch = false;
        Log.d("MarketingCloud", "newintent:");
        Bundle extra = intent.getExtras();
        String url = null;
        if (extra!=null) {
            url = extra.getString("url");
        }
        if (url!=null) {
            Log.d("MarketingCloud", "newintent:"+url);
            final Handler handler = new Handler();
            handler.postDelayed(new Runnable() {
                @Override
                public void run() {
                    String url = extra.getString("url");
                    handleUrl(null,url,"push");
                }
            }, delay*1000);

        }
    }

    public PendingIntent handleUrl(@NonNull Context context, @NonNull String url, @NonNull String urlSource) {
        Log.d(TAG, "marketingcloud handleurl, url:"+url);
        // make sure urls do not start with www UNLESS it is www.teamrwb.org
        if (url.startsWith("https://www.teamrwb.org/event") || url.startsWith("https://members-staging.teamrwb.org/events") || url.startsWith("https://members.teamrwb.org/events")
            || url.startsWith("https://members-staging.teamrwb.org/challenges") || url.startsWith("https://members.teamrwb.org/challenges")
            || url.startsWith("https://members-staging.teamrwb.org/groups") || url.startsWith("https://members.teamrwb.org/groups")) {

            Log.d(TAG, "Marketing in if with: "+url);
            Intent link = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
            link.setData(Uri.parse(url));
            startActivity(link);
            /*Old way Intent browser = new Intent(Intent.ACTION_VIEW);
            browser.setData(Uri.parse(url));
            startActivity(browser);*/

        } else {
            Log.d(TAG, "handle url opening web view: "+url);
            showWebview(url);
        }
        return null;
    }

    protected void showWebview(String urlStr) {
        runOnUiThread(new Runnable() {
            @Override
            public void run() {
                ViewGroup viewGroup = (ViewGroup) findViewById(android.R.id.content);
                if (mWebView == null)
                    mWebView = new WebView(MainActivity.getInstance());
                viewGroup.addView(mWebView);
                mWebView.setWebViewClient(new WebViewClient());
                mWebView.getSettings().setJavaScriptEnabled(true);
                mWebView.getSettings().setSupportMultipleWindows(false);
                mWebView.loadUrl(urlStr);
            }
        });

    }

    public void onBackPressed() {
        if (mWebView != null) {
            ViewGroup viewGroup = (ViewGroup) findViewById(android.R.id.content);
            viewGroup.removeView(mWebView);
            mWebView = null;
        }
        else {
            super.onBackPressed();
        }
    }

    ////////////////////////////
    // Facebook API callbacks
    ////////////////////////////

    /**
     * Returns the name of the main component registered from JavaScript. This is used to schedule
     * rendering of the component.
     */
    @Override
    protected String getMainComponentName() {
        return "TeamRWB";
    }

    /**
     * Returns the instance of the {@link ReactActivityDelegate}. There the RootView is created and
     * you can specify the renderer you wish to use - the new renderer (Fabric) or the old renderer
     * (Paper).
     */
    @Override
    protected ReactActivityDelegate createReactActivityDelegate() {
        return new MainActivityDelegate(this, getMainComponentName());
    }
    public static class MainActivityDelegate extends ReactActivityDelegate {
        public MainActivityDelegate(ReactActivity activity, String mainComponentName) {
            super(activity, mainComponentName);
        }
        @Override
        protected ReactRootView createRootView() {
            ReactRootView reactRootView = new ReactRootView(getContext());
            // If you opted-in for the New Architecture, we enable the Fabric Renderer.
            //BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
            reactRootView.setIsFabric(false);
            return reactRootView;
        }
        @Override
        protected boolean isConcurrentRootEnabled() {
            // If you opted-in for the New Architecture, we enable Concurrent Root (i.e. React 18).
            // More on this on https://reactjs.org/blog/2022/03/29/react-v18.html
            // BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
            return false;
        }
    }
}
