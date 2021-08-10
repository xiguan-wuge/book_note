
import { remove, isRegExp }  from '../shared/util.js'


function matches(pattern, name) {
  if(Array.isArray(pattern)) {
    return pattern.indexOf(name) > -1
  } else if(typeof pattern === 'string') {
    return pattern.split(',').indexOf(name) > -1
  } else if(isRegExp(pattern)) {
    return pattern.test(name)
  }

  return false
}

function getComponentName(opts) {
  return opts && (opts.Ctor.options.name || opts.tag)
}

// 从缓存中删除
function pruneCache(keepAliveInstance, filter) {
  const { cache, keys, _vnode } = keepAliveInstance
  for(const key in cache) {
    const entry = cache[key]
    if(entry) {
      const name = entry.name
      if(name && !filter(name)) {
        pruneCacheEntry(cache, key, keys, _vnode)
      }
    }
  }
}

/**
 * 移除数组中的对应项
 * @param {*} cache 缓存列表
 * @param {*} key 当前项key
 * @param {*} keys  keys数组
 * @param {*} current 当前组件
 */
 function pruneCacheEntry(cache, key, keys, current) {
  const entry = cache[key]
  if(entry && (!current || cache.tag !== current.tag)) {
    entry.componentInstance.$destroy()
  }
  cache[key] = null
  remove(keys, key)
}



export default {
  name: 'keep-alive',
  abstract: true,

  props: {
    include:  {
      type: [Array | String | RegExp],
      default: () => []
    },
    exclude:  {
      type: [Array | String | RegExp],
      default: () => []
    },
    max:  {
      type: [String | Number],
      default: 0
    }
  },
  created() {
    this.cache = Object.create(null)
    this.keys = []
  },
  destroyed() {
    for(const key in this.cache) {
      pruneCacheEntry(this.cache, key, this.keys)
    }
  },
  mounted() {
    this.cacheVNode()
    // watch inclue 和 exclue 移除缓存中不符合逻辑的组件
    this.$watch('include', val => {
      pruneCache(this, name => matches(val, name))
    })
    this.$watch('exclue', val => {
      pruneCache(this, name => !matches(val, name))
    })
  },
  updated() {
    this.cacheVNode()
  },
  methods: {
    // 将当前组件添加到缓存中
    cacheVNode() {
      const { cache, keys, vnodeToCache, keyToCache } = this
      if(vnodeToCache) {
        const { tag, componentInstance, componentOptions } = vnodeToCache
        cache[keyToCache] = {
          name: getComponentName(componentOptions),
          tag,
          componentInstance
        }

        keys.push(keyToCache)
        // 删除旧的缓存组件，将新的移动到数组的最后（LRU）
        if(this.max && keys.length > parseInt(this.max)) {
          // 删除缓存中的第一项
          pruneCacheEntry(cache, keys[0], keys, this._vnode)
          this.vnodeToCache = null
        }
      }
    }
  },
  render() {
    // 获取第一个子元素的VNode
    const slot = this.$slot.default
    const vnode = getFirstComponentChild(slot)
    const componentOptions = vnode && vnode.conponentOptions

    if(componentOptions) {
      // 检查参数
      const name = getComponentName(componentOptions)
      const { include, exclue } = this

      if(
        // 不在需要缓存项中
        (include && (!name || matches(include, name))) ||
        // 在 不需要换的项中
        (exclude && matches(exclude, name))
      ) {
        // 不是需要缓存的组件，直接返回该组件
        return vnode
      }

      // 是需要缓存的组件，添加到缓存中
      const {cache, keys} = this
      const key = vode.key == null
        ? componentOptions.Ctor.cid + (componentOptions.tag ? `::${componentOptions.tag}` : '')
        : vnode.key

      if(cache[key]) {
        // 在已缓存对象中，取出该缓存，并将该组件位置移动到keys数组的最后（LRU缓存）
        vnode.componentInstance = cache[key].componentInstance
        remove(keys, key)
        keys.push(key)
      } else {
        // 添加到缓存中
        this.vnodeToCache = vnode
        this.keyToCache = key
      }
      vnode.data.keepAlive = true
    }
    return vnode || (slot && slot[0])
  }
}