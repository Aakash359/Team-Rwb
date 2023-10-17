#import <Foundation/Foundation.h>

#import <React/RCTBridge.h>
#import <React/RCTConvert.h>

#import "DeviceID.h"

@implementation DeviceID

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(getDeviceIDString:(RCTResponseSenderBlock)callback){
  NSString *uuidString = [[UIDevice currentDevice].identifierForVendor UUIDString];
  callback(@[[NSNull null], uuidString]);
}

@end
