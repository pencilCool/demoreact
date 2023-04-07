function createRenderer(options) {
  const {
    createElement,
    insert,
    setElementText
  } = options


  function shouldSetAsProsp(el,key,value) {
    if(key === 'form' && el.tagName ==='INPUT') return false
    return key in el
  }


  function mountElement(vnode,container) {
    const el = vnode.el =  createElement(vnode.type)
    if(typeof vnode.children === 'string') {
      setElementText(el,vnode.children)
    } else if(Array.isArray(vnode.children)) {
      vnode.children.forEach(child => {
        patch(null,child,el) 
      });
    }

    if(vnode.props) {
      for (const key in vnode.props) {
        patchProps(el,key,null,vnode.props)
      }
    }
    insert(el,container)
  }

  function patch(n1,n2,container) {
    if(n1 && n1.type !== n2.type) {
      unmount(n1)
      n1 = null
    }
    
    const { type } = n2 
    if(typeof type === 'string') {
      if(!n1) {
        mountElement(n2,container)
      } else {
        patchElement(n1,n2)
      }
    } else if(typeof type === 'object') {

    } else if(type === "xxx"  ) {

    }
     
  }

  function unmount(vnode) {
    const parent = vnode.el.parentNode
    if (parent) {
      parent.removeChild(el)
    }
  }
  function render(vnode,container) {
      if(vnode) {
        patch(container._vnode,vnode,container)
      } else {
        if(container._vnode) {
          unmount(container._vnode)
        }
      }
      container._vnode = vnode
  }
  return {render}
}


const renderer = createRenderer({
  createElement(tag) {
    console.log(`create element ${tag}`)
    return {tag}
  },
  setElementText(el,text) {
    console.log(`set ${JSON.stringify(el)} text:${text}`)
    el.textContent = text
  },
  insert(el,parent,anchor=null) {
    console.log(`add ${JSON.stringify(el)} to ${JSON.stringify(parent)}`)
    parent.children = el
  },
  patchProps(el,key,prevValue,nextValue) {
    if(/^on/.test(key)) {
      let invoker = el._vei
      const name = key.slice(2).toLowerCase()
      if(nextValue) {
        if(!invoker) {
          invoker = el._vei = (e) => {
            invoker.value(e)
          }
          invoker.value = nextValue
          el.addEventListener(name,invoker)
        } else {
          invoker.value = nextValue
        }
      } else if(invoker) {
        el.removeEventListener(name,prevValue)
      }
     
    } else if(key==='class') {
      el.className = nextValue || ''
    }
    else if(shouldSetAsProsp(el,key,nextValue)) {
      const type = typeof el[key]
      const value = vnode.props[key]
      if (type === 'boolean' && nextValue === '') {
        el[key] = true
      } else {
        el[key] = nextValue
      }
    } else {
      el.setAttribute(key,nextValue)
    }
  }
})

const vnode = {
  type:'h1',
  props:{
    id:'foo'
  },
  children:[
    {
      type:'p',
      children:'hello'
    }
  ]
}

const container = {type:'root'}
renderer.render(vnode,container)