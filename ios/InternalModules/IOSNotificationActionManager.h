#import <Foundation/Foundation.h>

@interface IOSNotificationActionManager : NSObject

@property (nonatomic, retain) NSDictionary * _Nonnull lastActionInfo;
@property (nonatomic, copy) void (^lastCompletionHandler)(void);

+ (nonnull instancetype)sharedInstance;

@end
