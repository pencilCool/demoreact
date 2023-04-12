function createRenderer(options) {
  const {
    createElement,
    insert,
    setElementText,
    patchProps
  } = options

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
        patchProps(el,key,null,vnode.props[key])
      }
    }
    insert(el,container)
  }


  function patchElement(n1,n2) {
    const el = n2.el = n1.el 
    const oldProps = n1.props
    const newProps = n2.props

    for(const key in newProps) {
      if(newProps[key]!== oldProps[key]) {
        patchProps(el,key,oldProps[key],newProps[key])
      }
    }

    for(const key in oldProps) {
      if(!(key in newProps)) {
        patchProps(el,key,oldProps[key],null)
      }
    }
    patchChildren(n1,n2,el)
  }

  function patchChildren(n1,n2,container) {
    if(typeof n2.children === "string") {
      if(Array.isArray(n1.children)) {
        n1.children.forEach((c)=>unmount(c))
      }
      setElementText(container,n2.children)
    } else if(Array.isArrayn(n2.children)) {
      if(Array.isArray(n1.children)) {
        const oldChildren = n1.children
        const newChildren = n2.children
        for(let i = 0;i< newChildren.length;i++) {
          const newVNode = newChildren[i]  
          for(let j = 0;j < oldChildren.length;j++) {
            const oldVNode = oldChildren[j]
            if(newVNode.key == oldVNode.key) {
              patch(oldVNode,newVNode,container)
              break
            }
          }
        }
      } else {
        setElementText(container,"")
        n2.children.forEach(c=>patch(null,c,container))
      }
    } else {
      if(Array.isArray(n1.children)) {
        n1.children.forEach((c)=>unmount(c))
      } else if(typeof n1.children === 'string') {
        setElementText(container,"") 
      }
    }
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


function shouldSetAsProps(el,key,value) {
  if(key === 'form' && el.tagName ==='INPUT') return false
  return key in el
}


const renderer = createRenderer({
  createElement(tag) {
    console.log(`create element ${tag}`)
    // return {tag}
    return document.createElement(tag)
  },
  setElementText(el,text) {
    console.log(`set ${JSON.stringify(el)} text:${text}`)
    el.textContent = text
  },
  insert(el,parent,anchor=null) {
    console.log(`add ${JSON.stringify(el)} to ${JSON.stringify(parent)}`)
    parent.insertBefore(el,anchor)
  },
  patchProps(el,key,prevValue,nextValue) {
    if(/^on/.test(key)) {
      const  invokers = el._vei || (el._vei = {})
      let invoker = invokers[key]
      const name = key.slice(2).toLowerCase()
      if(nextValue) {
        if(!invoker) {
          invoker = el._vei[key] = (e) => {
            if(Array.isArray(invoker.value)) {
              invoker.value.forEach(fn=>fn(e))
            } else {
              invoker.value(e)
            }
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
    else if(shouldSetAsProps(el,key,nextValue)) {
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
