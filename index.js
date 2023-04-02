let activeEffect 

const bucket = new Set()
const  data = {text:"hello world"}
const obj = new Proxy(data,{
  get(target,key) {
    if(activeEffect) {
      bucket.add(activeEffect)
    }
    return target[key]
  },
  set(target,key,newVal) {
    target[key] = newVal
    bucket.forEach(fn => fn());
    return true
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
  obj.text = "hello vue3"
},1000)

