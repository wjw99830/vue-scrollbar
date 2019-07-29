import { VueConstructor } from 'vue';
import { plugin as FunctionBasedPlugin } from 'vue-function-api';
import { setVue } from './_vue';
import VueScrollbar from './VueScrollbar.vue';

const plugin = {
  install(Vue: VueConstructor) {
    Vue.use(FunctionBasedPlugin);
    setVue(Vue);
    Vue.component('vue-scrollbar', VueScrollbar);
  },
};
export default plugin;
