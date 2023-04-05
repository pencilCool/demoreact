//
//  TestReactOC.m
//  TestReactOC
//
//  Created by yuhua Tang on 2023/4/5.
//

#import <XCTest/XCTest.h>
#import "ReactProxy.h"

@interface Data:NSObject
@property (nonatomic,strong) NSString *flag;
@property (nonatomic,assign) NSInteger number;
@property (nonatomic,assign) BOOL ok;
@end

@implementation Data

@end

@interface TestReactOC : XCTestCase

@end

@implementation TestReactOC

- (void)setUp {
}

- (void)tearDown {
}

- (void)testExample {
    Data *data = [[Data alloc] init];
    data.flag = @"a";
    data.number = 1;
    data.ok = YES;
    Data *proxyData = [ReactProxy proxyWithTarget:data];
    effect(^{
        NSLog(@"effect run");
        proxyData.number;
    });
    proxyData.number = 3;
    proxyData.flag = @"c";
    proxyData.flag = @"d";
    proxyData.flag = @"e";
    proxyData.number = 5;
    proxyData.number = 6;
}

- (void)testBranch {
    Data *data = [[Data alloc] init];
    data.flag = @"a";
    data.number = 1;
    data.ok = YES;
    Data *proxyData = [ReactProxy proxyWithTarget:data];
    effect(^{
        NSString *flag = proxyData.ok ? proxyData.flag : @"No flag";
        NSLog(@"flag:%@",flag);
    });
   
    proxyData.ok = NO;
    proxyData.flag = @"B";
    proxyData.flag = @"C";
}

- (void)testNest {
    Data *data = [[Data alloc] init];
    data.flag = @"a";
    data.number = 1;
    data.ok = YES;
    Data *proxyData = [ReactProxy proxyWithTarget:data];
    effect(^{
        NSLog(@"effect1");
        effect(^{
            NSLog(@"effect2");
            NSString *string = proxyData.flag;
        });
        
        BOOL a = proxyData.ok;
        
    });
    NSLog(@"try change");
    proxyData.ok = NO;
}


- (void)testCircle  {
    Data *data = [[Data alloc] init];
    data.flag = @"a";
    data.number = 1;
    data.ok = YES;
    Data *proxyData = [ReactProxy proxyWithTarget:data];
    effect(^{
        NSLog(@"number");
         proxyData.number ++ ;
        
    });
    proxyData.ok = NO;
}




@end
