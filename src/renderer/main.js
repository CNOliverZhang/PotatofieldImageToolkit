import Vue from 'vue'
import axios from 'axios'
import App from './App'
import router from './router'
import store from './store'
import fontawesome from '@fortawesome/fontawesome'
import FontAwesomeIcon from '@fortawesome/vue-fontawesome'
import solid from '@fortawesome/fontawesome-free-solid'
import regular from '@fortawesome/fontawesome-free-regular'
import dialog from './components/dialog/dialog'
import VClamp from 'vue-clamp'
import ElementUI from 'element-ui';
import './theme/index.css'

fontawesome.library.add(solid)
fontawesome.library.add(regular)

Vue.component('font-awesome-icon', FontAwesomeIcon)
Vue.component('v-clamp', VClamp)

Vue.use(ElementUI)
Vue.use(dialog)

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app')
