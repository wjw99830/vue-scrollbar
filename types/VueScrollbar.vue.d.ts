declare const _default: import("vue").ComponentOptions<import("vue").default, {
    scrollThumbX: number;
    scrollThumbY: number;
    scrollTop: number;
    scrollLeft: number;
    onMousemove: () => void;
    onScroll: () => void;
    onMouseScrollStart: (e: MouseEvent, direction: ScrollDirection) => void;
}, never, never, {
    color: StringConstructor;
}, import("@vue/composition-api/dist/component/componentProps").ExtractPropTypes<{
    color: StringConstructor;
}, false>> & (new () => import("@vue/composition-api").ComponentRenderProxy<import("@vue/composition-api/dist/component/componentProps").ExtractPropTypes<{
    color: StringConstructor;
}, true>, {
    scrollThumbX: number;
    scrollThumbY: number;
    scrollTop: number;
    scrollLeft: number;
    onMousemove: () => void;
    onScroll: () => void;
    onMouseScrollStart: (e: MouseEvent, direction: ScrollDirection) => void;
}, import("@vue/composition-api/dist/component/componentProps").ExtractPropTypes<{
    color: StringConstructor;
}, false>>);
export default _default;
declare type ScrollDirection = 'x' | 'y';
