let activeEffect 

const effectStack =  []

const bucket = new WeakMap()

var  data = {foo:1,bar:2}
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
  const effectsToRun = new Set()
  effects && effects.forEach(effectFn => {
    if (effectFn !== activeEffect) {
      effectsToRun.add(effectFn)
    }
  });
  effectsToRun.forEach(effectFn => {
    if(effectFn.options.scheduler) {
      effectFn.options.scheduler(effectFn)
    } else {
      effectFn()
    }
  });
}

function cleanup(effectFn) {
  for(let i= 0;i< effectFn.deps.length;i++) {
    const deps = effectFn.deps[i]
    deps.delete(effectFn)
  }
  effectFn.deps.length == 0
}

function  effect(fn,options = {}) {
  const effectFn = () => {
    cleanup(effectFn)
    activeEffect = effectFn
    effectStack.push(effectFn)
    const res = fn() 
    effectStack.pop()
    activeEffect = effectStack[effectStack.length-1]
    return res
  }
  effectFn.options = options
  effectFn.deps = []
  if (!options.lazy) {
    effectFn()
  } 
  return effectFn
}

const jobQueue = new Set() 
const p = Promise.resolve()

let isFulshing = false
function flushJob() {
  if (isFulshing) return 
  isFulshing = true
  p.then(()=>{
    jobQueue.forEach(job=>job())
  }).finally(()=>{
    isFulshing = false
  })
}

function computed(getter) {
  let value
  let dirty = true 
  const effectFn = effect(getter,{
    lazy:true,
    scheduler() {
      dirty = true
      trigger(obj,value)
    }
  })

  const obj = {
    get value() {
      if(dirty) {
        value = effectFn()
        dirty = false
      }
      track(obj,value)
      return value
    }
  }
  return obj
}


const sumRes = computed(()=> obj.foo + obj.bar)
effect(function effectFn() {
  console.log("in")
  console.log(sumRes.value)
})

obj.foo ++ 