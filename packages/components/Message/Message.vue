<script setup lang="ts">
import type { MessageProps } from "./types";
import { computed, onMounted, ref } from "vue";
import { delay } from "lodash-es";
import { typeIconMap,RenderVnode } from "@toy-element/utils";

defineOptions({ name: "ErMessage" });

const props = withDefaults(defineProps<MessageProps>(), {
  type: "info",
  duration: 3000,
  offset: 10,
  transitionName: "fade-up",
});

const visible = ref(false);
const messageRef = ref<HTMLDivElement>();
const iconName = computed(() => typeIconMap.get(props.type) ?? "circle-info");

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

defineExpose({
  close
})
</script>

<template>
  <Transition :name="transitionName" @after-leave="!visible && onDestory()">
    <div
      ref="messageRef"
      class="er-message"
      :class="{
        [`er-message--${type}`]: type,
        'is-close': showClose,
        'text-center': center,
      }"
      v-show="visible"
      role="alert"
      @mouseenter="clearTimer"
      @mouseleave="startTimmer"
    >
      <er-icon class="er-message__icon" :icon="iconName" />
      <div class="er-message__content">
        <slot>
          <render-vnode v-if="message" :vNode="message" />
        </slot>
      </div>
      <div class="er-message__close" v-if="showClose">
        <er-icon icon="xmark" @click.stop="close" />
      </div>
    </div>
  </Transition>
</template>
