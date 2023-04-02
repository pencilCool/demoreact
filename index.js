let activeEffect 

const bucket = new WeakMap()

const  data = {text:"hello world"}
const obj = new Proxy(data,{
  get(target,key) {
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
    return target[key]
  },
  set(target,key,newVal) {
    target[key] = newVal
    
    const depsMap = bucket.get(target)
    if(!depsMap) return
    const effects = depsMap.get(key)
    effects && effects.forEach(fn => fn());
  }
})

function  effect(fn) {
  activeEffect = fn
  fn() 
}

effect(()=>{
  var a = obj.text
  console.log("in effect:",a)
})

setTimeout(()=>{
  obj.noExist = "hello vue3"
},1000)

