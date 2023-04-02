let activeEffect 

const bucket = new WeakMap()

const  data = {ok:true,text:"hello world"}
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
    fn() 
  }
  effectFn.deps = []
  effectFn()
}

effect(()=>{
  var a = obj.ok ? obj.text : 'no'
  console.log("in effect:",a)
})

setTimeout(()=>{
  obj.ok = false
  obj.text = "1"
  obj.text = "2"
},1000)


