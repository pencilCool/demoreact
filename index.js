let activeEffect 

const effectStack =  []

const bucket = new WeakMap()

var  data = {foo:1}
const obj = new Proxy(data,{
  get(target,key) {
    track(target,key)
    return target[key]
  },
  set(target,key,newVal) {
    target[key] = newVal
    trigger(target,key)
  }
})

function track(target,key) {
  if(!activeEffect) return target[key]
  let depsMap = bucket.get(target) 
  if (!depsMap) {
    bucket.set(target,(depsMap = new Map()))
  }
  let deps = depsMap.get(key)
  if(!deps) {
    depsMap.set(key,(deps = new Set()))    
  }
  deps.add(activeEffect)
  activeEffect.deps.push(deps)
}

function trigger(target,key) {
  const depsMap = bucket.get(target)
  if(!depsMap) return
  const effects = depsMap.get(key)
  const effectsToRun = new Set(effects)
  effectsToRun && effectsToRun.forEach(fn => fn());
}

function cleanup(effectFn) {
  for(let i= 0;i< effectFn.deps.length;i++) {
    const deps = effectFn.deps[i]
    deps.delete(effectFn)
  }
  effectFn.deps.length == 0
}

function  effect(fn) {
  const effectFn = () => {
    cleanup(effectFn)
    activeEffect = effectFn
    effectStack.push(effectFn)
    fn() 
    effectStack.pop()
    activeEffect = effectStack[effectStack.length-1]
  }
  effectFn.deps = []
  effectFn()
}

effect(() =>{
  console.log("effect")
  obj.foo = obj.foo + 1
})



