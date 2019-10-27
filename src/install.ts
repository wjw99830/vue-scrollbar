import { VueConstructor } from 'vue';
import FunctionBasedPlugin from '@vue/composition-api';
import VueScrollbar from './VueScrollbar.vue';

const plugin = {
  install(Vue: VueConstructor) {
    Vue.use(FunctionBasedPlugin);
    Vue.component('vue-scrollbar', VueScrollbar);
  },
};
export default plugin;
