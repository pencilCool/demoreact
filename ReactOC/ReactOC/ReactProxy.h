//
//  ReactProxy.h
//  ReactOC
//
//  Created by yuhua Tang on 2023/4/5.
//

#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN
@interface EffectOptions:NSObject
@end

typedef void (^EffectFunction)(void);
extern  void (^effect)(EffectFunction);
void (^effectWithOptions)(EffectFunction,EffectOptions *);



@interface EffectObject :NSObject
@property(nonatomic,copy) EffectFunction call;
@property(nonatomic,strong) NSMutableArray *deps;
@property(nonatomic,strong) EffectOptions *options;
@end

@interface ReactProxy : NSProxy

@property (nullable, nonatomic, weak, readonly) id target;

- (instancetype)initWithTarget:(id)target;

+ (instancetype)proxyWithTarget:(id)target;

@end
NS_ASSUME_NONNULL_END
