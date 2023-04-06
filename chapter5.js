let activeEffect;

const effectStack = [];

const bucket = new WeakMap();

var data = {
  foo: 1,
  get bar() {
    return this.foo;
  },
};

function reactive(obj) {
  return new Proxy(obj, {
    get(target, key, receiver) {
      if (key === "raw") {
        return target;
      }
      track(target, key);
      return Reflect.get(target, key, receiver);
    },
    set(target, key, newVal, receiver) {
      const oldVal = target[key];
      Reflect.set(target, key, newVal, receiver);
      if (target === receiver.raw) {
        trigger(target, key);
      }
    },
  });
}

function track(target, key) {
  if (!activeEffect) return target[key];
  let depsMap = bucket.get(target);
  if (!depsMap) {
    bucket.set(target, (depsMap = new Map()));
  }
  let deps = depsMap.get(key);
  if (!deps) {
    depsMap.set(key, (deps = new Set()));
  }
  deps.add(activeEffect);
  activeEffect.deps.push(deps);
}

function trigger(target, key) {
  const depsMap = bucket.get(target);
  if (!depsMap) return;
  const effects = depsMap.get(key);
  const effectsToRun = new Set();
  effects &&
    effects.forEach((effectFn) => {
      if (effectFn !== activeEffect) {
        effectsToRun.add(effectFn);
      }
    });
  effectsToRun.forEach((effectFn) => {
    if (effectFn.options.scheduler) {
      effectFn.options.scheduler(effectFn);
    } else {
      effectFn();
    }
  });
}

function cleanup(effectFn) {
  for (let i = 0; i < effectFn.deps.length; i++) {
    const deps = effectFn.deps[i];
    deps.delete(effectFn);
  }
  effectFn.deps.length == 0;
}

function effect(fn, options = {}) {
  const effectFn = () => {
    cleanup(effectFn);
    activeEffect = effectFn;
    effectStack.push(effectFn);
    const res = fn();
    effectStack.pop();
    activeEffect = effectStack[effectStack.length - 1];
    return res;
  };
  effectFn.options = options;
  effectFn.deps = [];
  if (!options.lazy) {
    effectFn();
  }
  return effectFn;
}

const obj = {};
const proto = { bar: 1 };
const child = reactive(obj);
const parent = reactive(proto);
Object.setPrototypeOf(child, parent);
effect(() => {
  console.log(child.bar);
});
child.bar = 2;
