import FunctionBasedPlugin, { ref, computed, onMounted, onUnmounted } from '@vue/composition-api';

var script = {
    props: {
        color: String,
    },
    setup() {
        let scrolling = false;
        let scrollDirection = 'y'; // x or y
        const inner = ref();
        const wrapper = ref();
        const scrollThumbY = ref(0); // percentage of horizontal scrollbar
        const scrollThumbX = ref(0); // percentage of vertical scrollbar
        const scrollTop = ref(0); // mock property based on raw, it's a percentage used in translate
        const scrollLeft = ref(0); // mock property based on raw, it's a percentage used in translate
        let scrollStartPosition = { x: 0, y: 0, top: 0, left: 0 }; // state before scroll
        const maxScrollTop = computed(() => {
            if (!wrapper.value) {
                return 0;
            }
            const content = wrapper.value.children[0];
            if (!content) {
                return 0;
            }
            return (1 - content.clientHeight / content.scrollHeight) * 100 / scrollThumbY.value * 100;
        });
        const maxScrollLeft = computed(() => {
            if (!wrapper.value) {
                return 0;
            }
            const content = wrapper.value.children[0];
            if (!content) {
                return 0;
            }
            return (1 - content.clientWidth / content.scrollWidth) * 100 / scrollThumbX.value * 100;
        });
        const onMouseScrollStart = (e, direction) => {
            scrolling = true;
            scrollDirection = direction;
            scrollStartPosition = {
                x: e.x,
                y: e.y,
                top: scrollTop.value,
                left: scrollLeft.value,
            };
        };
        const onScroll = () => {
            if (!scrolling && inner.value) {
                if (scrollThumbY.value < 100) {
                    scrollTop.value = inner.value.scrollTop / inner.value.scrollHeight * 100 / scrollThumbY.value * 100;
                }
                if (scrollThumbX.value < 100) {
                    scrollLeft.value = inner.value.scrollLeft / inner.value.scrollWidth * 100 / scrollThumbX.value * 100;
                }
            }
        };
        const onMouseScrollEnd = () => scrolling = false;
        const onMouseScroll = (e) => {
            const direction = scrollDirection;
            if (scrolling) {
                const { x, y } = e;
                if (inner.value) {
                    if (direction === 'y') {
                        const dy = y - scrollStartPosition.y;
                        const innerH = inner.value.clientHeight;
                        const top = scrollStartPosition.top + dy / innerH * 100 / scrollThumbY.value * 100; // calc diff based on percentage of thumb
                        scrollTop.value = Math.min(maxScrollTop.value, Math.max(0, top));
                        inner.value.scrollTop = scrollTop.value / 100 * innerH * scrollThumbY.value * 0.01 / innerH * inner.value.scrollHeight;
                    }
                    else {
                        const dx = x - scrollStartPosition.x;
                        const innerW = inner.value.clientWidth;
                        const left = scrollStartPosition.left + dx / innerW * 100 / scrollThumbX.value * 100;
                        scrollLeft.value = Math.min(maxScrollLeft.value, Math.max(0, left));
                        inner.value.scrollLeft = scrollLeft.value / 100 * innerW * scrollThumbX.value * 0.01 / innerW * inner.value.scrollWidth;
                    }
                }
            }
        };
        const onMousemove = () => {
            if (inner.value) {
                const currentScrollThumbY = inner.value.clientHeight / inner.value.scrollHeight * 100;
                const currentScrollThumbX = inner.value.clientWidth / inner.value.scrollWidth * 100;
                if (scrollThumbY.value !== currentScrollThumbY || scrollThumbX.value !== currentScrollThumbX) {
                    scrollThumbY.value = currentScrollThumbY;
                    scrollThumbX.value = currentScrollThumbX;
                }
            }
        };
        onMounted(() => {
            document.addEventListener('mouseup', onMouseScrollEnd);
            document.addEventListener('mousemove', onMouseScroll);
        });
        onUnmounted(() => {
            document.removeEventListener('mouseup', onMouseScrollEnd);
            document.removeEventListener('mousemove', onMouseScroll);
        });
        return {
            wrapper,
            inner,
            scrollThumbX,
            scrollThumbY,
            scrollTop,
            scrollLeft,
            onMousemove,
            onScroll,
            onMouseScrollStart,
        };
    },
};

function normalizeComponent(template, style, script, scopeId, isFunctionalTemplate, moduleIdentifier
/* server only */
, shadowMode, createInjector, createInjectorSSR, createInjectorShadow) {
  if (typeof shadowMode !== 'boolean') {
    createInjectorSSR = createInjector;
    createInjector = shadowMode;
    shadowMode = false;
  } // Vue.extend constructor export interop.


  var options = typeof script === 'function' ? script.options : script; // render functions

  if (template && template.render) {
    options.render = template.render;
    options.staticRenderFns = template.staticRenderFns;
    options._compiled = true; // functional template

    if (isFunctionalTemplate) {
      options.functional = true;
    }
  } // scopedId


  if (scopeId) {
    options._scopeId = scopeId;
  }

  var hook;

  if (moduleIdentifier) {
    // server build
    hook = function hook(context) {
      // 2.3 injection
      context = context || // cached call
      this.$vnode && this.$vnode.ssrContext || // stateful
      this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext; // functional
      // 2.2 with runInNewContext: true

      if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
        context = __VUE_SSR_CONTEXT__;
      } // inject component styles


      if (style) {
        style.call(this, createInjectorSSR(context));
      } // register component module identifier for async chunk inference


      if (context && context._registeredComponents) {
        context._registeredComponents.add(moduleIdentifier);
      }
    }; // used by ssr in case component is cached and beforeCreate
    // never gets called


    options._ssrRegister = hook;
  } else if (style) {
    hook = shadowMode ? function () {
      style.call(this, createInjectorShadow(this.$root.$options.shadowRoot));
    } : function (context) {
      style.call(this, createInjector(context));
    };
  }

  if (hook) {
    if (options.functional) {
      // register for functional component in vue file
      var originalRender = options.render;

      options.render = function renderWithStyleInjection(h, context) {
        hook.call(context);
        return originalRender(h, context);
      };
    } else {
      // inject component registration as beforeCreate hook
      var existing = options.beforeCreate;
      options.beforeCreate = existing ? [].concat(existing, hook) : [hook];
    }
  }

  return script;
}

var normalizeComponent_1 = normalizeComponent;

/* script */
const __vue_script__ = script;
/* template */
var __vue_render__ = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "div",
    {
      ref: "wrapper",
      staticClass: "vue-scrollbar",
      on: { mousemove: _vm.onMousemove }
    },
    [
      _c(
        "div",
        {
          ref: "inner",
          staticClass: "vue-scrollbar--inner",
          on: { scroll: _vm.onScroll }
        },
        [_vm._t("default")],
        2
      ),
      _vm._v(" "),
      _c(
        "div",
        { staticClass: "vue-scrollbar--pathway vue-scrollbar--pathway--y" },
        [
          _c("div", {
            directives: [
              {
                name: "show",
                rawName: "v-show",
                value: _vm.scrollThumbY < 100,
                expression: "scrollThumbY < 100"
              }
            ],
            staticClass: "vue-scrollbar--thumb",
            style: {
              transform: "translateY(" + _vm.scrollTop + "%)",
              height: _vm.scrollThumbY + "%",
              backgroundColor: _vm.color || "black"
            },
            attrs: { onselectstart: "return false" },
            on: {
              mousedown: function($event) {
                return _vm.onMouseScrollStart($event, "y")
              }
            }
          })
        ]
      ),
      _vm._v(" "),
      _c(
        "div",
        { staticClass: "vue-scrollbar--pathway vue-scrollbar--pathway--x" },
        [
          _c("div", {
            directives: [
              {
                name: "show",
                rawName: "v-show",
                value: _vm.scrollThumbX < 100,
                expression: "scrollThumbX < 100"
              }
            ],
            staticClass: "vue-scrollbar--thumb",
            style: {
              transform: "translateX(" + _vm.scrollLeft + "%)",
              width: _vm.scrollThumbX + "%",
              backgroundColor: _vm.color || "black"
            },
            attrs: { onselectstart: "return false" },
            on: {
              mousedown: function($event) {
                return _vm.onMouseScrollStart($event, "x")
              }
            }
          })
        ]
      )
    ]
  )
};
var __vue_staticRenderFns__ = [];
__vue_render__._withStripped = true;

  /* style */
  const __vue_inject_styles__ = undefined;
  /* scoped */
  const __vue_scope_id__ = undefined;
  /* module identifier */
  const __vue_module_identifier__ = undefined;
  /* functional template */
  const __vue_is_functional_template__ = false;
  /* style inject */
  
  /* style inject SSR */
  

  
  var VueScrollbar = normalizeComponent_1(
    { render: __vue_render__, staticRenderFns: __vue_staticRenderFns__ },
    __vue_inject_styles__,
    __vue_script__,
    __vue_scope_id__,
    __vue_is_functional_template__,
    __vue_module_identifier__,
    undefined,
    undefined
  );

const plugin = {
    install(Vue) {
        Vue.use(FunctionBasedPlugin);
        Vue.component('vue-scrollbar', VueScrollbar);
    },
};

export default plugin;
