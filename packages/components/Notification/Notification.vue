<script setup lang="ts">
import type { NotificationProps, NotificationCompInstance } from "./types";
import { computed, onMounted, ref } from "vue";
import { getLastBottomOffset } from "./methods";
import { delay, bind } from "lodash-es";
import { useOffset } from "@toy-element/hooks";
import { addUnit } from "@toy-element/utils";
import { typeIconMap, RenderVnode } from "@toy-element/utils";
import ErIcon from "../Icon/Icon.vue";

defineOptions({ name: "ErNotification" });

const props = withDefaults(defineProps<NotificationProps>(), {
  type: "info",
  duration: 3000,
  offset: 20,
  transitionName: "fade",
  showClose: true,
});

const visible = ref(false);
const notifyRef = ref<HTMLDivElement>();
// div 高度
const boxHeight = ref(0);

const { topOffset, bottomOffset } = useOffset({
  getLastBottomOffset: bind(getLastBottomOffset, props),
  offset: props.offset,
  boxHeight,
});

const iconName = computed(() => typeIconMap.get(props.type) ?? "circle-info");

const customStyle = computed(() => ({
  top: addUnit(topOffset.value),
  zIndex: props.zIndex,
}));

let timer: number;
function startTimmer() {
  if (props.duration === 0) return;
  timer = delay(close, props.duration);
}

function clearTimer() {
  clearTimeout(timer);
}

function close() {
  visible.value = false;
}

onMounted(() => {
  visible.value = true;
  startTimmer();
});

defineExpose<NotificationCompInstance>({
  bottomOffset,
  close,
});
</script>

<template>
  <transition
    :name="`er-notification-${transitionName}`"
    @after-leave="!visible && onDestory()"
    @enter="boxHeight = notifyRef!.getBoundingClientRect().height"
  >
    <div
      ref="notifyRef"
      class="er-notification"
      :class="{
        [`er-notification--${type}`]: type,
        'show-close': showClose,
      }"
      :style="customStyle"
      v-show="visible"
      role="alert"
      @click="onClick"
      @mouseenter="clearTimer"
      @mouseleave="startTimmer"
    >
      <er-icon v-if="iconName" :icon="iconName" class="er-notification__icon" />

      <div class="er-notification__text">
        <div class="er-notification__title">{{ title }}</div>
        <div class="er-notification__content">
          <slot>
            <render-vnode v-if="message" :vNode="message" />
          </slot>
        </div>
      </div>
      <div class="er-notification__close" v-if="showClose">
        <er-icon icon="xmark" @click.stop="close" />
      </div>
    </div>
  </transition>
</template>

<style>
@import './style.css';
</style>