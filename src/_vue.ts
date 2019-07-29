import { VueConstructor } from 'vue';

export let _Vue: VueConstructor;
export const setVue = (Vue: VueConstructor) => _Vue = Vue;
