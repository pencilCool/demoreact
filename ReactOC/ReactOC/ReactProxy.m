//
//  ReactProxy.m
//  ReactOC
//
//  Created by yuhua Tang on 2023/4/5.
//

#import "ReactProxy.h"



static NSCache *bucket;
static NSMutableArray<EffectObject*> *effectStack;
EffectObject *activeEffect;


@implementation EffectOptions
@end

@implementation EffectObject

@end


void cleanup(EffectObject *effectFn) {
    for(int i= 0;i<effectFn.deps.count;i++) {
        NSMutableSet *deps = effectFn.deps[i];
        [deps removeObject:effectFn];
    }
    [effectFn.deps removeAllObjects];
}

void (^effect)(EffectFunction) = ^void(EffectFunction fn){
    effectWithOptions(fn,nil);
};


void (^effectWithOptions)(EffectFunction,EffectOptions *) = ^void(EffectFunction fn,EffectOptions *options){
    EffectObject *effectObject = [EffectObject new];
    effectObject.deps = @[].mutableCopy;
    effectObject.options = options;
    EffectFunction effectFn = ^void(void){
        cleanup(effectObject);
        activeEffect = effectObject;
        [effectStack addObject:effectObject];
        fn();
        [effectStack removeLastObject];
        activeEffect = effectStack.lastObject;
    };
   
    effectObject.call = effectFn;
    effectFn();
};



void track(id target,NSString *propertyName) {
    if(!activeEffect) {
        return;
    }
    
    NSMutableDictionary *depsMap = [bucket objectForKey:target];
    if(!depsMap) {
        depsMap = @{}.mutableCopy;
        [bucket setObject:depsMap forKey:target];
    }
    
    NSMutableSet *deps = depsMap[propertyName];
    if (!deps) {
        deps = [NSMutableSet setWithArray:@[]];
        [depsMap setObject:deps forKey:propertyName];
    }
    
    [deps addObject:activeEffect];
    [activeEffect.deps addObject:deps];
}


void trigger(id target,NSString *propertyName) {
    NSMutableDictionary *depsMap = [bucket objectForKey:target];
    if(!depsMap) return;
    
    NSMutableSet *effects = depsMap[propertyName];
    if (!effects) return;
    NSMutableSet *effectsToRun = [[NSMutableSet alloc] init];
    [effects enumerateObjectsUsingBlock:^(id  _Nonnull obj, BOOL * _Nonnull stop) {
        if(obj != activeEffect) {
            [effectsToRun addObject:obj];
        }
    }];
    
    [effectsToRun enumerateObjectsUsingBlock:^(id  _Nonnull obj, BOOL * _Nonnull stop) {
        EffectObject *eff = obj;
        eff.call();
    }];
}


@implementation ReactProxy

- (instancetype)initWithTarget:(id)target {
    _target = target;
    return self;
}

+ (instancetype)proxyWithTarget:(id)target {
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        bucket = [[NSCache alloc] init];
        effectStack = @[].mutableCopy;
    });
    return [[ReactProxy alloc] initWithTarget:target];
}

//- (id)forwardingTargetForSelector:(SEL)selector {
//    return _target;
//}

- (void)forwardInvocation:(NSInvocation *)invocation {
    
    NSString *propertyName = nil;
    propertyName = [self propertyNameScanFromGetterSelector:invocation.selector];
    if (propertyName) {
        track(_target,propertyName);
        [invocation setTarget:_target];
        [invocation invoke];
        return;
    }
    
    propertyName = [self propertyNameScanFromSetterSelector:invocation.selector];
    if (propertyName) {
        [invocation setTarget:_target];
        [invocation invoke];
        trigger(_target, propertyName);
        return;
    }
    
    [super forwardInvocation:invocation];
}

- (NSMethodSignature *)methodSignatureForSelector:(SEL)selector {
    return [_target methodSignatureForSelector:selector];
}

- (BOOL)respondsToSelector:(SEL)aSelector {
    return [_target respondsToSelector:aSelector];
}

- (BOOL)isEqual:(id)object {
    return [_target isEqual:object];
}

- (NSUInteger)hash {
    return [_target hash];
}

- (Class)superclass {
    return [_target superclass];
}

- (Class)class {
    return [_target class];
}

- (BOOL)isKindOfClass:(Class)aClass {
    return [_target isKindOfClass:aClass];
}

- (BOOL)isMemberOfClass:(Class)aClass {
    return [_target isMemberOfClass:aClass];
}

- (BOOL)conformsToProtocol:(Protocol *)aProtocol {
    return [_target conformsToProtocol:aProtocol];
}

- (BOOL)isProxy {
    return YES;
}

- (NSString *)description {
    return [_target description];
}

- (NSString *)debugDescription {
    return [_target debugDescription];
}

- (NSString *)propertyNameScanFromGetterSelector:(SEL)selector
{
    NSString *selectorName = NSStringFromSelector(selector);
    NSUInteger parameterCount = [[selectorName componentsSeparatedByString:@":"] count] - 1;
    if (parameterCount == 0) {
        return selectorName;
    }
    return nil;
}

- (NSString *)propertyNameScanFromSetterSelector:(SEL)selector
{
    NSString *selectorName = NSStringFromSelector(selector);
    NSUInteger parameterCount = [[selectorName componentsSeparatedByString:@":"] count] - 1;
    if ([selectorName hasPrefix:@"set"] && parameterCount == 1) {
        NSUInteger firstColonLocation = [selectorName rangeOfString:@":"].location;
        return [selectorName substringWithRange:NSMakeRange(3, firstColonLocation - 3)].lowercaseString;
    }
    return nil;
}

@end
