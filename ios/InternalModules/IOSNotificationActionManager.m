#import "IOSNotificationActionManager.h"

@implementation IOSNotificationActionManager

+ (nonnull instancetype)sharedInstance {
  static IOSNotificationActionManager *sharedInstance = nil;
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    sharedInstance = [self new];
  });
  return sharedInstance;
}

@end
