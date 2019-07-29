import { value, computed, onMounted, onDestroyed, plugin as plugin$1 } from 'vue-function-api';

let _Vue;
const setVue = (Vue) => _Vue = Vue;

var script = _Vue.extend({
    props: {
        color: String,
    },
    setup(props, ctx) {
        let scrolling = false;
        let scrollDirection = 'y'; // x or y
        const scrollThumbY = value(0); // percentage of horizontal scrollbar
        const scrollThumbX = value(0); // percentage of vertical scrollbar
        const scrollTop = value(0); // mock property based on raw, it's a percentage used in translate
        const scrollLeft = value(0); // mock property based on raw, it's a percentage used in translate
        let scrollStartPosition = { x: 0, y: 0, top: 0, left: 0 }; // state before scroll
        const maxScrollTop = computed(() => {
            const wrapper = ctx.refs.wrapper;
            if (!wrapper) {
                return 0;
            }
            const content = wrapper.children[0];
            if (!content) {
                return 0;
            }
            return (1 - content.clientHeight / content.scrollHeight) * 100 / scrollThumbY.value * 100;
        });
        const maxScrollLeft = computed(() => {
            const wrapper = ctx.refs.wrapper;
            if (!wrapper) {
                return 0;
            }
            const content = wrapper.children[0];
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
            const inner = ctx.refs.inner;
            if (!scrolling && inner) {
                if (scrollThumbY.value < 100) {
                    scrollTop.value = inner.scrollTop / inner.scrollHeight * 100 / scrollThumbY.value * 100;
                }
                if (scrollThumbX.value < 100) {
                    scrollLeft.value = inner.scrollLeft / inner.scrollWidth * 100 / scrollThumbX.value * 100;
                }
            }
        };
        const onMouseScrollEnd = () => scrolling = false;
        const onMouseScroll = (e) => {
            const direction = scrollDirection;
            if (scrolling) {
                const { x, y } = e;
                const inner = ctx.refs.inner;
                if (inner) {
                    if (direction === 'y') {
                        const dy = y - scrollStartPosition.y;
                        const innerH = inner.clientHeight;
                        const top = scrollStartPosition.top + dy / innerH * 100 / scrollThumbY.value * 100; // calc diff based on percentage of thumb
                        scrollTop.value = Math.min(maxScrollTop.value, Math.max(0, top));
                        inner.scrollTop = scrollTop.value / 100 * innerH * scrollThumbY.value * 0.01 / innerH * inner.scrollHeight;
                    }
                    else {
                        const dx = x - scrollStartPosition.x;
                        const innerW = inner.clientWidth;
                        const left = scrollStartPosition.left + dx / innerW * 100 / scrollThumbX.value * 100;
                        scrollLeft.value = Math.min(maxScrollLeft.value, Math.max(0, left));
                        inner.scrollLeft = scrollLeft.value / 100 * innerW * scrollThumbX.value * 0.01 / innerW * inner.scrollWidth;
                    }
                }
            }
        };
        const onMousemove = () => {
            const inner = ctx.refs.inner;
            if (inner) {
                const currentScrollThumbY = inner.clientHeight / inner.scrollHeight * 100;
                const currentScrollThumbX = inner.clientWidth / inner.scrollWidth * 100;
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
        onDestroyed(() => {
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
    inject("data-v-68722c20_0", { source: "\n.vue-scrollbar {\r\n  position: relative;\r\n  overflow: hidden;\n}\n.vue-scrollbar:hover > .vue-scrollbar--pathway {\r\n  opacity: .3;\n}\n.vue-scrollbar--pathway {\r\n  position: absolute;\r\n  opacity: 0;\r\n  transition: opacity .2s;\r\n  cursor: pointer;\n}\n.vue-scrollbar--pathway--y {\r\n  height: 100%;\r\n  width: 7px;\r\n  right: 0;\r\n  top: 0;\n}\n.vue-scrollbar--pathway--x {\r\n  width: 100%;\r\n  height: 7px;\r\n  bottom: 0;\n}\n.vue-scrollbar--thumb {\r\n  width: 100%;\r\n  height: 100%;\r\n  border-radius: 30px;\n}\n.vue-scrollbar--inner {\r\n  overflow: scroll;\r\n  width: calc(100% + 17px);\r\n  height: calc(100% + 17px);\n}\n.vue-scrollbar--inner::-webkit-scrollbar {\r\n  width: 17px;\r\n  height: 17px;\r\n  background-color: transparent;\n}\r\n", map: {"version":3,"sources":["D:\\Workspace\\vue-scrollbar\\src\\VueScrollbar.vue"],"names":[],"mappings":";AA+IA;EACA,kBAAA;EACA,gBAAA;AACA;AACA;EACA,WAAA;AACA;AACA;EACA,kBAAA;EACA,UAAA;EACA,uBAAA;EACA,eAAA;AACA;AACA;EACA,YAAA;EACA,UAAA;EACA,QAAA;EACA,MAAA;AACA;AACA;EACA,WAAA;EACA,WAAA;EACA,SAAA;AACA;AACA;EACA,WAAA;EACA,YAAA;EACA,mBAAA;AACA;AACA;EACA,gBAAA;EACA,wBAAA;EACA,yBAAA;AACA;AACA;EACA,WAAA;EACA,YAAA;EACA,6BAAA;AACA","file":"VueScrollbar.vue","sourcesContent":["<template>\r\n  <div class=\"vue-scrollbar\" ref=\"wrapper\" @mousemove=\"onMousemove\">\r\n    <div\r\n      ref=\"inner\"\r\n      class=\"vue-scrollbar--inner\"\r\n      @scroll=\"onScroll\"\r\n    >\r\n      <slot></slot>\r\n    </div>\r\n    <div class=\"vue-scrollbar--pathway vue-scrollbar--pathway--y\">\r\n      <div\r\n        onselectstart=\"return false\"\r\n        class=\"vue-scrollbar--thumb\"\r\n        v-show=\"scrollThumbY < 100\"\r\n        :style=\"{ transform: `translateY(${scrollTop}%)`, height: scrollThumbY + '%', backgroundColor: color || 'black' }\"\r\n        @mousedown=\"onMouseScrollStart($event, 'y')\"\r\n      ></div>\r\n    </div>\r\n    <div class=\"vue-scrollbar--pathway vue-scrollbar--pathway--x\">\r\n      <div\r\n        onselectstart=\"return false\"\r\n        class=\"vue-scrollbar--thumb\"\r\n        v-show=\"scrollThumbX < 100\"\r\n        :style=\"{ transform: `translateX(${scrollLeft}%)`, width: scrollThumbX + '%', backgroundColor: color || 'black' }\"\r\n        @mousedown=\"onMouseScrollStart($event, 'x')\"\r\n      ></div>\r\n    </div>\r\n  </div>\r\n</template>\r\n<script lang='ts'>\r\nimport { _Vue as Vue } from './_vue';\r\nimport { value, computed, onMounted, onDestroyed } from 'vue-function-api';\r\nexport default Vue.extend({\r\n  props: {\r\n    color: String,\r\n  },\r\n  setup(props, ctx) {\r\n    let scrolling = false;\r\n    let scrollDirection: ScrollDirection = 'y'; // x or y\r\n    const scrollThumbY = value(0); // percentage of horizontal scrollbar\r\n    const scrollThumbX = value(0); // percentage of vertical scrollbar\r\n    const scrollTop = value(0); // mock property based on raw, it's a percentage used in translate\r\n    const scrollLeft = value(0); // mock property based on raw, it's a percentage used in translate\r\n    let scrollStartPosition = { x: 0, y: 0, top: 0, left: 0 }; // state before scroll\r\n    const maxScrollTop = computed(() => {\r\n      const wrapper = ctx.refs.wrapper as HTMLElement | void;\r\n      if (!wrapper) {\r\n        return 0;\r\n      }\r\n      const content = wrapper.children[0];\r\n      if (!content) {\r\n        return 0;\r\n      }\r\n      return (1 - content.clientHeight / content.scrollHeight) * 100 / scrollThumbY.value * 100;\r\n    });\r\n    const maxScrollLeft = computed(() => {\r\n      const wrapper = ctx.refs.wrapper as HTMLElement | void;\r\n      if (!wrapper) {\r\n        return 0;\r\n      }\r\n      const content = wrapper.children[0];\r\n      if (!content) {\r\n        return 0;\r\n      }\r\n      return (1 - content.clientWidth / content.scrollWidth) * 100 / scrollThumbX.value * 100;\r\n    });\r\n    const onMouseScrollStart = (e: MouseEvent, direction: ScrollDirection) => {\r\n      scrolling = true;\r\n      scrollDirection = direction;\r\n      scrollStartPosition = {\r\n        x: e.x,\r\n        y: e.y,\r\n        top: scrollTop.value,\r\n        left: scrollLeft.value,\r\n      };\r\n    };\r\n    const onScroll = () => {\r\n      const inner = ctx.refs.inner as HTMLElement | void;\r\n      if (!scrolling && inner) {\r\n        if (scrollThumbY.value < 100) {\r\n          scrollTop.value = inner.scrollTop / inner.scrollHeight * 100 / scrollThumbY.value * 100;\r\n        }\r\n        if (scrollThumbX.value < 100) {\r\n          scrollLeft.value = inner.scrollLeft / inner.scrollWidth * 100 / scrollThumbX.value * 100;\r\n        }\r\n      }\r\n    };\r\n    const onMouseScrollEnd = () => scrolling = false;\r\n    const onMouseScroll = (e: MouseEvent) => {\r\n      const direction = scrollDirection;\r\n      if (scrolling) {\r\n        const { x, y } = e;\r\n        const inner = ctx.refs.inner as HTMLElement | void;\r\n        if (inner) {\r\n          if (direction === 'y') {\r\n            const dy = y - scrollStartPosition.y;\r\n            const innerH = inner.clientHeight;\r\n            const top = scrollStartPosition.top + dy / innerH * 100 / scrollThumbY.value * 100; // calc diff based on percentage of thumb\r\n            scrollTop.value = Math.min(maxScrollTop.value, Math.max(0, top));\r\n            inner.scrollTop = scrollTop.value / 100 * innerH * scrollThumbY.value * 0.01 / innerH * inner.scrollHeight;\r\n          } else {\r\n            const dx = x - scrollStartPosition.x;\r\n            const innerW = inner.clientWidth;\r\n            const left = scrollStartPosition.left + dx / innerW * 100 / scrollThumbX.value * 100;\r\n            scrollLeft.value = Math.min(maxScrollLeft.value, Math.max(0, left));\r\n            inner.scrollLeft = scrollLeft.value / 100 * innerW * scrollThumbX.value * 0.01 / innerW * inner.scrollWidth;\r\n          }\r\n        }\r\n      }\r\n    };\r\n    const onMousemove = () => {\r\n      const inner = ctx.refs.inner as HTMLElement | void;\r\n      if (inner) {\r\n        const currentScrollThumbY = inner.clientHeight / inner.scrollHeight * 100;\r\n        const currentScrollThumbX = inner.clientWidth / inner.scrollWidth * 100;\r\n        if (scrollThumbY.value !== currentScrollThumbY || scrollThumbX.value !== currentScrollThumbX) {\r\n          scrollThumbY.value = currentScrollThumbY;\r\n          scrollThumbX.value = currentScrollThumbX;\r\n        }\r\n      }\r\n    };\r\n    onMounted(() => {\r\n      document.addEventListener('mouseup', onMouseScrollEnd);\r\n      document.addEventListener('mousemove', onMouseScroll);\r\n    });\r\n    onDestroyed(() => {\r\n      document.removeEventListener('mouseup', onMouseScrollEnd);\r\n      document.removeEventListener('mousemove', onMouseScroll);\r\n    });\r\n    return {\r\n      scrollThumbX,\r\n      scrollThumbY,\r\n      scrollTop,\r\n      scrollLeft,\r\n      onMousemove,\r\n      onScroll,\r\n      onMouseScrollStart,\r\n    };\r\n  },\r\n})\r\ntype ScrollDirection = 'x' | 'y';\r\n</script>\r\n<style>\r\n.vue-scrollbar {\r\n  position: relative;\r\n  overflow: hidden;\r\n}\r\n.vue-scrollbar:hover > .vue-scrollbar--pathway {\r\n  opacity: .3;\r\n}\r\n.vue-scrollbar--pathway {\r\n  position: absolute;\r\n  opacity: 0;\r\n  transition: opacity .2s;\r\n  cursor: pointer;\r\n}\r\n.vue-scrollbar--pathway--y {\r\n  height: 100%;\r\n  width: 7px;\r\n  right: 0;\r\n  top: 0;\r\n}\r\n.vue-scrollbar--pathway--x {\r\n  width: 100%;\r\n  height: 7px;\r\n  bottom: 0;\r\n}\r\n.vue-scrollbar--thumb {\r\n  width: 100%;\r\n  height: 100%;\r\n  border-radius: 30px;\r\n}\r\n.vue-scrollbar--inner {\r\n  overflow: scroll;\r\n  width: calc(100% + 17px);\r\n  height: calc(100% + 17px);\r\n}\r\n.vue-scrollbar--inner::-webkit-scrollbar {\r\n  width: 17px;\r\n  height: 17px;\r\n  background-color: transparent;\r\n}\r\n</style>\r\n"]}, media: undefined });

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
        Vue.use(plugin$1);
        setVue(Vue);
        Vue.component('vue-scrollbar', VueScrollbar);
    },
};

export default plugin;
