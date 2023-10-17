#define INTERNAL_SCHEME @"teamrwb"

#import "AppDelegate.h"

#import <React/RCTBridge.h>
#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>

#import <React/RCTAppSetupUtils.h>

#import <Firebase.h>
#import <UserNotifications/UserNotifications.h>
#import <RNCPushNotificationIOS.h>
#import <React/RCTLinkingManager.h>
#import <GoogleMaps/GoogleMaps.h>
#import <FBSDKCoreKit/FBSDKCoreKit.h>
#import <MarketingCloudSDK/MarketingCloudSDK.h>
#import <SafariServices/SafariServices.h>
#import "IOSNotificationAction.h"

#if RCT_NEW_ARCH_ENABLED
#import <React/CoreModulesPlugins.h>
#import <React/RCTCxxBridgeDelegate.h>
#import <React/RCTFabricSurfaceHostingProxyRootView.h>
#import <React/RCTSurfacePresenter.h>
#import <React/RCTSurfacePresenterBridgeAdapter.h>
#import <ReactCommon/RCTTurboModuleManager.h>

#import <react/config/ReactNativeConfig.h>

static NSString *const kRNConcurrentRoot = @"concurrentRoot";

@interface SKWelcomeViewController () <SFSafariViewControllerDelegate>

@interface AppDelegate () <RCTCxxBridgeDelegate, RCTTurboModuleManagerDelegate> {
  RCTTurboModuleManager *_turboModuleManager;
  RCTSurfacePresenterBridgeAdapter *_bridgeAdapter;
  std::shared_ptr<const facebook::react::ReactNativeConfig> _reactNativeConfig;
  facebook::react::ContextContainer::Shared _contextContainer;
}
@end
#endif

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  RCTAppSetupPrepareApp(application);

#if RCT_NEW_ARCH_ENABLED
  _contextContainer = std::make_shared<facebook::react::ContextContainer const>();
  _reactNativeConfig = std::make_shared<facebook::react::EmptyReactNativeConfig const>();
  _contextContainer->insert("ReactNativeConfig", _reactNativeConfig);
  _bridgeAdapter = [[RCTSurfacePresenterBridgeAdapter alloc] initWithBridge:bridge contextContainer:_contextContainer];
  bridge.surfacePresenter = _bridgeAdapter.surfacePresenter;
#endif

 // https://github.com/react-native-datetimepicker/datetimepicker/issues/285
  // fix for date picker on iOS 14 and until depenency is update
  // TODO: update react native modal dependency, figure out centering
  if (@available(iOS 14, *)) {
    UIDatePicker *picker = [UIDatePicker appearance];
    picker.preferredDatePickerStyle = UIDatePickerStyleWheels;
  }

  MarketingCloudSDKConfigBuilder *mcsdkBuilder = [MarketingCloudSDKConfigBuilder new];
  
  [mcsdkBuilder sfmc_setApplicationId:@"d9b0a738-bafb-46f3-ae4a-13dad3bda775"];
  [mcsdkBuilder sfmc_setAccessToken:@"TV5a28KLKEej11H7NsUOoKAc"];
  [mcsdkBuilder sfmc_setAnalyticsEnabled:@(YES)];
  [mcsdkBuilder sfmc_setMarketingCloudServerUrl:@"https://mc3qx2l8dqdxdhhq0h-9hdd3zqym.device.marketingcloudapis.com/"];
  [mcsdkBuilder sfmc_setLocationEnabled:@(YES)];
  [mcsdkBuilder sfmc_setDelayRegistrationUntilContactKeyIsSet:@(YES)];
  NSError *error = nil;
  BOOL success =
      [[MarketingCloudSDK sharedInstance] sfmc_configureWithDictionary:[mcsdkBuilder sfmc_build]
                                                                error:&error];
  if (success == YES) {
      dispatch_async(dispatch_get_main_queue(), ^{
        if (@available(iOS 10, *)) {
            // set the UNUserNotificationCenter delegate - the delegate must be set here in
            // didFinishLaunchingWithOptions
            [UNUserNotificationCenter currentNotificationCenter].delegate = self;
            [[UIApplication sharedApplication] registerForRemoteNotifications];

            [[UNUserNotificationCenter currentNotificationCenter]
                requestAuthorizationWithOptions:UNAuthorizationOptionAlert |
                                                UNAuthorizationOptionSound |
                                                UNAuthorizationOptionBadge
                              completionHandler:^(BOOL granted, NSError *_Nullable error) {
                                if (error == nil) {
                                    if (granted == YES) {
                                        dispatch_async(dispatch_get_main_queue(), ^{
                                                       });
                                    }
                                }
                              }];
        } else {
#if __IPHONE_OS_VERSION_MIN_REQUIRED < 100000
            UIUserNotificationSettings *settings = [UIUserNotificationSettings
                settingsForTypes:UIUserNotificationTypeBadge | UIUserNotificationTypeSound |
                                 UIUserNotificationTypeAlert
                      categories:nil];
            [[UIApplication sharedApplication] registerUserNotificationSettings:settings];
#endif
            [[UIApplication sharedApplication] registerForRemoteNotifications];
        }
      });
  } else {
      //  MarketingCloudSDK sfmc_configure failed
      os_log_debug(OS_LOG_DEFAULT, "MarketingCloudSDK sfmc_configure failed with error = %@",
                   error);
  }
  [[MarketingCloudSDK sharedInstance] sfmc_setURLHandlingDelegate:self];
  if ([CLLocationManager locationServicesEnabled]) {

      switch ([CLLocationManager authorizationStatus]) {
        case kCLAuthorizationStatusDenied:
            NSLog(@"HH: kCLAuthorizationStatusDenied");
            break;
        case kCLAuthorizationStatusRestricted:
            NSLog(@"HH: kCLAuthorizationStatusRestricted");
            break;
        case kCLAuthorizationStatusAuthorizedAlways:
            [[MarketingCloudSDK sharedInstance] sfmc_startWatchingLocation];
            NSLog(@"HH: kCLAuthorizationStatusAuthorizedAlways");
            break;
        case kCLAuthorizationStatusAuthorizedWhenInUse:
            [[MarketingCloudSDK sharedInstance] sfmc_startWatchingLocation];
            NSLog(@"HH: kCLAuthorizationStatusAuthorizedWhenInUse");
            break;
        case kCLAuthorizationStatusNotDetermined:
            NSLog(@"HH: kCLAuthorizationStatusNotDetermined");
            break;
        default:
            break;
      }
  }
  
  
  [FIRApp configure];
  [GMSServices provideAPIKey:@"AIzaSyCbDHXm80h-QwyCzSyl_cR48F6u23r5DDg"];

  NSMutableDictionary *newLaunchOptions = [NSMutableDictionary dictionaryWithDictionary:launchOptions];
  if (launchOptions[UIApplicationLaunchOptionsRemoteNotificationKey]) {
    NSDictionary *remoteNotif = launchOptions[UIApplicationLaunchOptionsRemoteNotificationKey];
    NSString *linkURL = @"";
    // for salesforce mobile push with challenge/event url passed in as openDirect
    if (remoteNotif[@"_od"]) {
      linkURL = remoteNotif[@"_od"];
    }
    // for firebase event pushes with an event_id
    else if (remoteNotif[@"event_id"]) {
      linkURL = [@"https://members.teamrwb.org/events/" stringByAppendingString:remoteNotif[@"event_id"]];
    }
    if (!launchOptions[UIApplicationLaunchOptionsURLKey]) {
      newLaunchOptions[UIApplicationLaunchOptionsURLKey] = [NSURL URLWithString:linkURL];
    }
  }

  RCTBridge *bridge = [[RCTBridge alloc] initWithDelegate:self launchOptions:newLaunchOptions];
  RCTRootView *rootView = [[RCTRootView alloc] initWithBridge:bridge
                                                   moduleName:@"TeamRWB"
                                            initialProperties:nil];

  if (@available(iOS 13.0, *)) {
    rootView.backgroundColor = [UIColor systemBackgroundColor];
  } else {
    rootView.backgroundColor = [UIColor whiteColor];
  }

  self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
  UIViewController *rootViewController = [UIViewController new];
  rootViewController.view = rootView;
  self.window.rootViewController = rootViewController;
  [self.window makeKeyAndVisible];
  UIView *launchScreenView = [[[NSBundle mainBundle] loadNibNamed:@"LaunchScreen" owner:self options:nil] objectAtIndex:0];
  launchScreenView.frame = self.window.bounds;
  rootView.loadingView = launchScreenView;
  return YES;
}

- (BOOL)application:(UIApplication *)application openURL:(NSURL *)url
            options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options
{
  NSLog(@"push Application opened with url: %@", [url absoluteString]);
  
  if ([[url scheme] isEqualToString:INTERNAL_SCHEME]) {
    NSLog(@"push Handling internal deeplink...");
    return [RCTLinkingManager application:application
                                  openURL:url
                                  options:options];
  }
  else {
    return NO;
  }
}

- (BOOL)application:(UIApplication *)application continueUserActivity:(nonnull NSUserActivity *)userActivity restorationHandler:(nonnull void (^)(NSArray<id<UIUserActivityRestoring>> * _Nullable))restorationHandler {
  return [RCTLinkingManager application:application
                   continueUserActivity:userActivity
                     restorationHandler:restorationHandler];
}

// Required to register for notifications
- (void)application:(UIApplication *)application didRegisterUserNotificationSettings:(UIUserNotificationSettings *)notificationSettings
{
  [RNCPushNotificationIOS didRegisterUserNotificationSettings:notificationSettings];
}

- (void)safariViewControllerDidFinish:(SFSafariViewController *)controller {
    [self.window.rootViewController dismissViewControllerAnimated:true completion:nil];
}

- (void)handleUrl:(NSURL *)url {
  NSLog(@"URL handled:%@",url);
  if (
      [[url absoluteString] hasPrefix:@"https://www.teamrwb.org/event"] ||
      [[url absoluteString] hasPrefix:@"https://members.teamrwb.org/events"] ||
      [[url absoluteString] hasPrefix:@"https://members.teamrwb.org/groups"] ||
      [[url absoluteString] hasPrefix:@"https://members.teamrwb.org/challenges"] ||
      [[url absoluteString] hasPrefix:@"https://members-staging.teamrwb.org/events"] ||
      [[url absoluteString] hasPrefix:@"https://members-staging.teamrwb.org/groups"] ||
      [[url absoluteString] hasPrefix:@"https://members-staging.teamrwb.org/challenges"]) {
    [RCTLinkingManager application:[UIApplication sharedApplication]
                          openURL:url
                          options:@{}];
  } else {
    SFSafariViewController *svc = [[SFSafariViewController alloc] initWithURL:url];
    [self.window.rootViewController presentViewController:svc animated:YES completion:nil];
  }
}
-(void) sfmc_handleURL:(NSURL *_Nonnull)url type:(NSString * _Nonnull)type {
  [self performSelector:@selector(handleUrl:) withObject:url afterDelay:1.5];
}

// Required for the register event.
- (void)application:(UIApplication *)application didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken
{
  const unsigned *tokenBytes = (const unsigned *) [deviceToken bytes];
  NSString *hexToken = [NSString stringWithFormat:@"%08x%08x%08x%08x%08x%08x%08x%08x",
                       ntohl(tokenBytes[0]), ntohl(tokenBytes[1]), ntohl(tokenBytes[2]),
                       ntohl(tokenBytes[3]), ntohl(tokenBytes[4]), ntohl(tokenBytes[5]),
                       ntohl(tokenBytes[6]), ntohl(tokenBytes[7])];
  NSLog(@"push token:%@",hexToken);
  NSLog(@"push token:%@",deviceToken);
  [[MarketingCloudSDK sharedInstance] sfmc_setDeviceToken:deviceToken];
  [RNCPushNotificationIOS didRegisterForRemoteNotificationsWithDeviceToken:deviceToken];
}
// Required for the notification event. You must call the completion handler after handling the remote notification (push notification).
- (void)application:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)userInfo
fetchCompletionHandler:(void (^)(UIBackgroundFetchResult))completionHandler
{
     NSLog(@"notification:%@",userInfo);
  [[MarketingCloudSDK sharedInstance] sfmc_setNotificationUserInfo:userInfo];
  if (completionHandler != nil) {
    completionHandler(UIBackgroundFetchResultNoData);
  }
  [RNCPushNotificationIOS didReceiveRemoteNotification:userInfo fetchCompletionHandler:completionHandler];
}
- (void)userNotificationCenter:(UNUserNotificationCenter *)center
    didReceiveNotificationResponse:(UNNotificationResponse *)response
             withCompletionHandler:(void (^)(void))completionHandler {

    // Handling push notifications that we sent through apns.py
    NSDictionary *responseObject = response.notification.request.content.userInfo;
    NSString *rwb_url = nil;
    NSString *sf_open_direct = nil;
    if (responseObject) {
      rwb_url = [responseObject objectForKey:@"rwb_url"];
      sf_open_direct = [responseObject objectForKey:@"_od"];
      if (rwb_url) {
        NSURL *url = [NSURL URLWithString:rwb_url];
        [self performSelector:@selector(handleUrl:) withObject:url afterDelay:1.5];
      } else if (sf_open_direct) {
        NSURL *url = [NSURL URLWithString:sf_open_direct];
        [self performSelector:@selector(handleUrl:) withObject:url afterDelay:1.5];
      }
    }
    
  
    // tell the MarketingCloudSDK about the notification
    if (rwb_url == nil) {
      [[MarketingCloudSDK sharedInstance] sfmc_setNotificationRequest:response.notification.request];
    }
    // IOS 10+ Required for localNotification event
    [RNCPushNotificationIOS didReceiveNotificationResponse:response];
    if (completionHandler != nil) {
        completionHandler();
    }
}
// Required for the registrationError event.
- (void)application:(UIApplication *)application didFailToRegisterForRemoteNotificationsWithError:(NSError *)error
{
  //[RNCPushNotificationIOS didFailToRegisterForRemoteNotificationsWithError:error];
}
// Required for the localNotification event.
- (void)application:(UIApplication *)application didReceiveLocalNotification:(UILocalNotification *)notification
{
  [RNCPushNotificationIOS didReceiveLocalNotification:notification];
}

// Called when a notification is received from the foreground.
-(void)userNotificationCenter:(UNUserNotificationCenter *)center willPresentNotification:(UNNotification *)notification withCompletionHandler:(void (^)(UNNotificationPresentationOptions options))completionHandler
{
  completionHandler(UNAuthorizationOptionSound | UNAuthorizationOptionAlert | UNAuthorizationOptionBadge);
}

- (void)application:(UIApplication *)application handleActionWithIdentifier:(nullable NSString *)identifier forLocalNotification:(nonnull UILocalNotification *)notification withResponseInfo:(nonnull NSDictionary *)responseInfo completionHandler:(nonnull void (^)())completionHandler
{
  [IOSNotificationAction application:application handleActionWithIdentifier:identifier forLocalNotification:notification withResponseInfo:responseInfo completionHandler:completionHandler];
}
- (void)application:(UIApplication *)application handleActionWithIdentifier:(NSString *)identifier forRemoteNotification:(NSDictionary *)userInfo withResponseInfo:(NSDictionary *)responseInfo completionHandler:(void (^)())completionHandler
{
  NSLog(@"push handle action with ident");
  if (completionHandler!=nil)
    completionHandler();
  [IOSNotificationAction application:application handleActionWithIdentifier:identifier forRemoteNotification:userInfo withResponseInfo:responseInfo completionHandler:completionHandler];
}

/// This method controls whether the `concurrentRoot`feature of React18 is turned on or off.
///
/// @see: https://reactjs.org/blog/2022/03/29/react-v18.html
/// @note: This requires to be rendering on Fabric (i.e. on the New Architecture).
/// @return: `true` if the `concurrentRoot` feture is enabled. Otherwise, it returns `false`.
- (BOOL)concurrentRootEnabled
{
  // Switch this bool to turn on and off the concurrent root
  return true;
}

- (NSDictionary *)prepareInitialProps
{
  NSMutableDictionary *initProps = [NSMutableDictionary new];

#ifdef RCT_NEW_ARCH_ENABLED
  initProps[kRNConcurrentRoot] = @([self concurrentRootEnabled]);
#endif

  return initProps;
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

#if RCT_NEW_ARCH_ENABLED

#pragma mark - RCTCxxBridgeDelegate

- (std::unique_ptr<facebook::react::JSExecutorFactory>)jsExecutorFactoryForBridge:(RCTBridge *)bridge
{
  _turboModuleManager = [[RCTTurboModuleManager alloc] initWithBridge:bridge
                                                             delegate:self
                                                            jsInvoker:bridge.jsCallInvoker];
  return RCTAppSetupDefaultJsExecutorFactory(bridge, _turboModuleManager);
}

#pragma mark RCTTurboModuleManagerDelegate

- (Class)getModuleClassFromName:(const char *)name
{
  return RCTCoreModulesClassProvider(name);
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:(const std::string &)name
                                                      jsInvoker:(std::shared_ptr<facebook::react::CallInvoker>)jsInvoker
{
  return nullptr;
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:(const std::string &)name
                                                     initParams:
                                                         (const facebook::react::ObjCTurboModule::InitParams &)params
{
  return nullptr;
}

- (id<RCTTurboModule>)getModuleInstanceFromClass:(Class)moduleClass
{
  return RCTAppSetupDefaultModuleFromClass(moduleClass);
}

#endif

@end
