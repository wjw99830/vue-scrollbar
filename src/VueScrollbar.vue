<template>
  <div class="vue-scrollbar" ref="wrapper" @mousemove="onMousemove">
    <div
      ref="inner"
      class="vue-scrollbar--inner"
      @scroll="onScroll"
    >
      <slot></slot>
    </div>
    <div class="vue-scrollbar--pathway vue-scrollbar--pathway--y">
      <div
        onselectstart="return false"
        class="vue-scrollbar--thumb"
        v-show="scrollThumbY < 100"
        :style="{ transform: `translateY(${scrollTop}%)`, height: scrollThumbY + '%', backgroundColor: color || 'black' }"
        @mousedown="onMouseScrollStart($event, 'y')"
      ></div>
    </div>
    <div class="vue-scrollbar--pathway vue-scrollbar--pathway--x">
      <div
        onselectstart="return false"
        class="vue-scrollbar--thumb"
        v-show="scrollThumbX < 100"
        :style="{ transform: `translateX(${scrollLeft}%)`, width: scrollThumbX + '%', backgroundColor: color || 'black' }"
        @mousedown="onMouseScrollStart($event, 'x')"
      ></div>
    </div>
  </div>
</template>
<script lang="ts">
import { ref, computed, onMounted, onUnmounted, Ref } from '@vue/composition-api';
export default {
  props: {
    color: String,
  },
  setup() {
    let scrolling = false;
    let scrollDirection: ScrollDirection = 'y'; // x or y
    const inner: Ref<HTMLDivElement | undefined> = ref();
    const wrapper: Ref<HTMLDivElement | undefined> = ref();
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
    const onMouseScrollStart = (e: MouseEvent, direction: ScrollDirection) => {
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
    const onMouseScroll = (e: MouseEvent) => {
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
          } else {
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
type ScrollDirection = 'x' | 'y';
</script>
<style>
.vue-scrollbar {
  position: relative;
  overflow: hidden;
}
.vue-scrollbar:hover > .vue-scrollbar--pathway {
  opacity: .3;
}
.vue-scrollbar--pathway {
  position: absolute;
  opacity: 0;
  transition: opacity .2s;
  cursor: pointer;
}
.vue-scrollbar--pathway--y {
  height: 100%;
  width: 7px;
  right: 0;
  top: 0;
}
.vue-scrollbar--pathway--x {
  width: 100%;
  height: 7px;
  bottom: 0;
}
.vue-scrollbar--thumb {
  width: 100%;
  height: 100%;
  border-radius: 30px;
}
.vue-scrollbar--inner {
  overflow: scroll;
  width: calc(100% + 17px);
  height: calc(100% + 17px);
}
.vue-scrollbar--inner::-webkit-scrollbar {
  width: 17px;
  height: 17px;
  background-color: transparent;
}
</style>
