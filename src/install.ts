import { VueConstructor } from 'vue';
import { plugin as FunctionBasedPlugin } from 'vue-function-api';
import VueScrollbar from './VueScrollbar.vue';

const plugin = {
  install(Vue: VueConstructor) {
    Vue.use(FunctionBasedPlugin);
    Vue.component('vue-scrollbar', VueScrollbar);
  },
};
export default plugin;
