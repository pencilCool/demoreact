function createRenderer(options) {
  const {
    createElement,
    insert,
    setElementText
  } = options

  function mountElement(vnode,container) {
    const el = createElement(vnode.type)
    if(typeof vnode.children === 'string') {
      setElementText(el,vnode.children)
    } else if(Array.isArray(vnode.children)) {
      vnode.children.forEach(child => {
        patch(null,child,container) 
      });
    }
    insert(el,container)
  }

  function patch(n1,n2,container) {
      if(!n1) {
        mountElement(n2,container)
      } else {

      }
  }
  function render(vnode,container) {
      if(vnode) {
        patch(container._vnode,vnode,container)
      } else {
        if(container._vnode) {
          container.innerHTML = ""
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
  }
})

const vnode = {
  type:'h1',
  children:[
    {
      type:'p',
      children:'hello'
    }
  ]
}

const container = {type:'root'}
renderer.render(vnode,container)