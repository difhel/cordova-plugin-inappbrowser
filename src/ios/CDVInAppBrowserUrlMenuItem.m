/*
 *
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */

#import "CDVInAppBrowserUrlMenuItem.h"

@implementation CDVInAppBrowserUrlMenuItem

- (id)init
{
    if (self = [super init]) {
      self.key = nil;
      self.value = nil;
    }

    return self;
}

+ (NSArray<CDVInAppBrowserUrlMenuItem *> *)parseMenu:(NSArray *)array
{
    if (array == nil)
      return nil;

    NSMutableArray<CDVInAppBrowserUrlMenuItem *> *items = [NSMutableArray array];

    for (id obj in array) {
        if (![obj isKindOfClass:[NSDictionary class]]) {
            continue;
        }

    NSDictionary *dict = (NSDictionary *)obj;

    NSString *key = dict[@"key"];
    NSString *value = dict[@"value"];

    CDVInAppBrowserUrlMenuItem *item = [[CDVInAppBrowserUrlMenuItem alloc] init];
    item.key = key ?: @"";
    item.value = value ?: @"";

    [items addObject:item];
  }

  return [items copy];
}

@end
