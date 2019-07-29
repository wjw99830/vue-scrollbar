import { VueConstructor } from 'vue';
import VueScrollbar from './VueScrollbar.vue';
declare const plugin: {
    install(Vue: VueConstructor<VueScrollbar>): void;
};
export default plugin;
