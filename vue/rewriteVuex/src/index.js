import { Store, install } from './store'
import { 
  mapState, 
  mapGetters, 
  mapActions, 
  mapMutations, 
  createNamespacedhelper, 
} from './helpers'
import createLogger from './plugin/logger'
export default {
  Store,
  install,
  version: '__VERSION__',
  mapState,
  mapMutations,
  mapGetters,
  mapActions,
  createNamespacedhelper,
  createLogger
}

export {
  Store,
  install,
  mapState,
  mapMutations,
  mapGetters,
  mapActions,
  createNamespacedhelper,
  createLogger
}