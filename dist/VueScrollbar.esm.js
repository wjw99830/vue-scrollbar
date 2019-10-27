import FunctionBasedPlugin, { createComponent, ref, computed, onMounted, onUnmounted } from '@vue/composition-api';

var script = createComponent({
    props: {
        color: String,
    },
    setup(props) {
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
                if (inner) {
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
            if (inner) {
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
            scrollThumbX,
            scrollThumbY,
            scrollTop,
            scrollLeft,
            onMousemove,
            onScroll,
            onMouseScrollStart,
        };
    },
});

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

var isOldIE = typeof navigator !== 'undefined' && /msie [6-9]\\b/.test(navigator.userAgent.toLowerCase());
function createInjector(context) {
  return function (id, style) {
    return addStyle(id, style);
  };
}
var HEAD;
var styles = {};

function addStyle(id, css) {
  var group = isOldIE ? css.media || 'default' : id;
  var style = styles[group] || (styles[group] = {
    ids: new Set(),
    styles: []
  });

  if (!style.ids.has(id)) {
    style.ids.add(id);
    var code = css.source;

    if (css.map) {
      // https://developer.chrome.com/devtools/docs/javascript-debugging
      // this makes source maps inside style tags work properly in Chrome
      code += '\n/*# sourceURL=' + css.map.sources[0] + ' */'; // http://stackoverflow.com/a/26603875

      code += '\n/*# sourceMappingURL=data:application/json;base64,' + btoa(unescape(encodeURIComponent(JSON.stringify(css.map)))) + ' */';
    }

    if (!style.element) {
      style.element = document.createElement('style');
      style.element.type = 'text/css';
      if (css.media) style.element.setAttribute('media', css.media);

      if (HEAD === undefined) {
        HEAD = document.head || document.getElementsByTagName('head')[0];
      }

      HEAD.appendChild(style.element);
    }

    if ('styleSheet' in style.element) {
      style.styles.push(code);
      style.element.styleSheet.cssText = style.styles.filter(Boolean).join('\n');
    } else {
      var index = style.ids.size - 1;
      var textNode = document.createTextNode(code);
      var nodes = style.element.childNodes;
      if (nodes[index]) style.element.removeChild(nodes[index]);
      if (nodes.length) style.element.insertBefore(textNode, nodes[index]);else style.element.appendChild(textNode);
    }
  }
}

var browser = createInjector;

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
  const __vue_inject_styles__ = function (inject) {
    if (!inject) return
    inject("data-v-0a765391_0", { source: "\n.vue-scrollbar {\n  position: relative;\n  overflow: hidden;\n}\n.vue-scrollbar:hover > .vue-scrollbar--pathway {\n  opacity: .3;\n}\n.vue-scrollbar--pathway {\n  position: absolute;\n  opacity: 0;\n  transition: opacity .2s;\n  cursor: pointer;\n}\n.vue-scrollbar--pathway--y {\n  height: 100%;\n  width: 7px;\n  right: 0;\n  top: 0;\n}\n.vue-scrollbar--pathway--x {\n  width: 100%;\n  height: 7px;\n  bottom: 0;\n}\n.vue-scrollbar--thumb {\n  width: 100%;\n  height: 100%;\n  border-radius: 30px;\n}\n.vue-scrollbar--inner {\n  overflow: scroll;\n  width: calc(100% + 17px);\n  height: calc(100% + 17px);\n}\n.vue-scrollbar--inner::-webkit-scrollbar {\n  width: 17px;\n  height: 17px;\n  background-color: transparent;\n}\n", map: {"version":3,"sources":["/Users/wangjiwei/vue-scrollbar/src/VueScrollbar.vue"],"names":[],"mappings":";AA2IA;EACA,kBAAA;EACA,gBAAA;AACA;AACA;EACA,WAAA;AACA;AACA;EACA,kBAAA;EACA,UAAA;EACA,uBAAA;EACA,eAAA;AACA;AACA;EACA,YAAA;EACA,UAAA;EACA,QAAA;EACA,MAAA;AACA;AACA;EACA,WAAA;EACA,WAAA;EACA,SAAA;AACA;AACA;EACA,WAAA;EACA,YAAA;EACA,mBAAA;AACA;AACA;EACA,gBAAA;EACA,wBAAA;EACA,yBAAA;AACA;AACA;EACA,WAAA;EACA,YAAA;EACA,6BAAA;AACA","file":"VueScrollbar.vue","sourcesContent":["<template>\n  <div class=\"vue-scrollbar\" ref=\"wrapper\" @mousemove=\"onMousemove\">\n    <div\n      ref=\"inner\"\n      class=\"vue-scrollbar--inner\"\n      @scroll=\"onScroll\"\n    >\n      <slot></slot>\n    </div>\n    <div class=\"vue-scrollbar--pathway vue-scrollbar--pathway--y\">\n      <div\n        onselectstart=\"return false\"\n        class=\"vue-scrollbar--thumb\"\n        v-show=\"scrollThumbY < 100\"\n        :style=\"{ transform: `translateY(${scrollTop}%)`, height: scrollThumbY + '%', backgroundColor: color || 'black' }\"\n        @mousedown=\"onMouseScrollStart($event, 'y')\"\n      ></div>\n    </div>\n    <div class=\"vue-scrollbar--pathway vue-scrollbar--pathway--x\">\n      <div\n        onselectstart=\"return false\"\n        class=\"vue-scrollbar--thumb\"\n        v-show=\"scrollThumbX < 100\"\n        :style=\"{ transform: `translateX(${scrollLeft}%)`, width: scrollThumbX + '%', backgroundColor: color || 'black' }\"\n        @mousedown=\"onMouseScrollStart($event, 'x')\"\n      ></div>\n    </div>\n  </div>\n</template>\n<script lang=\"ts\">\nimport { ref, computed, onMounted, onUnmounted, Ref, createComponent } from '@vue/composition-api';\nexport default createComponent({\n  props: {\n    color: String,\n  },\n  setup(props) {\n    let scrolling = false;\n    let scrollDirection: ScrollDirection = 'y'; // x or y\n    const inner: Ref<HTMLDivElement | undefined> = ref();\n    const wrapper: Ref<HTMLDivElement | undefined> = ref();\n    const scrollThumbY = ref(0); // percentage of horizontal scrollbar\n    const scrollThumbX = ref(0); // percentage of vertical scrollbar\n    const scrollTop = ref(0); // mock property based on raw, it's a percentage used in translate\n    const scrollLeft = ref(0); // mock property based on raw, it's a percentage used in translate\n    let scrollStartPosition = { x: 0, y: 0, top: 0, left: 0 }; // state before scroll\n    const maxScrollTop = computed(() => {\n      if (!wrapper.value) {\n        return 0;\n      }\n      const content = wrapper.value.children[0];\n      if (!content) {\n        return 0;\n      }\n      return (1 - content.clientHeight / content.scrollHeight) * 100 / scrollThumbY.value * 100;\n    });\n    const maxScrollLeft = computed(() => {\n      if (!wrapper.value) {\n        return 0;\n      }\n      const content = wrapper.value.children[0];\n      if (!content) {\n        return 0;\n      }\n      return (1 - content.clientWidth / content.scrollWidth) * 100 / scrollThumbX.value * 100;\n    });\n    const onMouseScrollStart = (e: MouseEvent, direction: ScrollDirection) => {\n      scrolling = true;\n      scrollDirection = direction;\n      scrollStartPosition = {\n        x: e.x,\n        y: e.y,\n        top: scrollTop.value,\n        left: scrollLeft.value,\n      };\n    };\n    const onScroll = () => {\n      if (!scrolling && inner.value) {\n        if (scrollThumbY.value < 100) {\n          scrollTop.value = inner.value.scrollTop / inner.value.scrollHeight * 100 / scrollThumbY.value * 100;\n        }\n        if (scrollThumbX.value < 100) {\n          scrollLeft.value = inner.value.scrollLeft / inner.value.scrollWidth * 100 / scrollThumbX.value * 100;\n        }\n      }\n    };\n    const onMouseScrollEnd = () => scrolling = false;\n    const onMouseScroll = (e: MouseEvent) => {\n      const direction = scrollDirection;\n      if (scrolling) {\n        const { x, y } = e;\n        if (inner) {\n          if (direction === 'y') {\n            const dy = y - scrollStartPosition.y;\n            const innerH = inner.value.clientHeight;\n            const top = scrollStartPosition.top + dy / innerH * 100 / scrollThumbY.value * 100; // calc diff based on percentage of thumb\n            scrollTop.value = Math.min(maxScrollTop.value, Math.max(0, top));\n            inner.value.scrollTop = scrollTop.value / 100 * innerH * scrollThumbY.value * 0.01 / innerH * inner.value.scrollHeight;\n          } else {\n            const dx = x - scrollStartPosition.x;\n            const innerW = inner.value.clientWidth;\n            const left = scrollStartPosition.left + dx / innerW * 100 / scrollThumbX.value * 100;\n            scrollLeft.value = Math.min(maxScrollLeft.value, Math.max(0, left));\n            inner.value.scrollLeft = scrollLeft.value / 100 * innerW * scrollThumbX.value * 0.01 / innerW * inner.value.scrollWidth;\n          }\n        }\n      }\n    };\n    const onMousemove = () => {\n      if (inner) {\n        const currentScrollThumbY = inner.value.clientHeight / inner.value.scrollHeight * 100;\n        const currentScrollThumbX = inner.value.clientWidth / inner.value.scrollWidth * 100;\n        if (scrollThumbY.value !== currentScrollThumbY || scrollThumbX.value !== currentScrollThumbX) {\n          scrollThumbY.value = currentScrollThumbY;\n          scrollThumbX.value = currentScrollThumbX;\n        }\n      }\n    };\n    onMounted(() => {\n      document.addEventListener('mouseup', onMouseScrollEnd);\n      document.addEventListener('mousemove', onMouseScroll);\n    });\n    onUnmounted(() => {\n      document.removeEventListener('mouseup', onMouseScrollEnd);\n      document.removeEventListener('mousemove', onMouseScroll);\n    });\n    return {\n      scrollThumbX,\n      scrollThumbY,\n      scrollTop,\n      scrollLeft,\n      onMousemove,\n      onScroll,\n      onMouseScrollStart,\n    };\n  },\n});\ntype ScrollDirection = 'x' | 'y';\n</script>\n<style>\n.vue-scrollbar {\n  position: relative;\n  overflow: hidden;\n}\n.vue-scrollbar:hover > .vue-scrollbar--pathway {\n  opacity: .3;\n}\n.vue-scrollbar--pathway {\n  position: absolute;\n  opacity: 0;\n  transition: opacity .2s;\n  cursor: pointer;\n}\n.vue-scrollbar--pathway--y {\n  height: 100%;\n  width: 7px;\n  right: 0;\n  top: 0;\n}\n.vue-scrollbar--pathway--x {\n  width: 100%;\n  height: 7px;\n  bottom: 0;\n}\n.vue-scrollbar--thumb {\n  width: 100%;\n  height: 100%;\n  border-radius: 30px;\n}\n.vue-scrollbar--inner {\n  overflow: scroll;\n  width: calc(100% + 17px);\n  height: calc(100% + 17px);\n}\n.vue-scrollbar--inner::-webkit-scrollbar {\n  width: 17px;\n  height: 17px;\n  background-color: transparent;\n}\n</style>\n"]}, media: undefined });

  };
  /* scoped */
  const __vue_scope_id__ = undefined;
  /* module identifier */
  const __vue_module_identifier__ = undefined;
  /* functional template */
  const __vue_is_functional_template__ = false;
  /* style inject SSR */
  

  
  var VueScrollbar = normalizeComponent_1(
    { render: __vue_render__, staticRenderFns: __vue_staticRenderFns__ },
    __vue_inject_styles__,
    __vue_script__,
    __vue_scope_id__,
    __vue_is_functional_template__,
    __vue_module_identifier__,
    browser,
    undefined
  );

const plugin = {
    install(Vue) {
        Vue.use(FunctionBasedPlugin);
        Vue.component('vue-scrollbar', VueScrollbar);
    },
};

export default plugin;
