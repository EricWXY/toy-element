<script setup>
import { ref } from "vue";

const options = ref([
  { value: "beijing", label: "Beijing" },
  { value: "shanghai", label: "Shanghai" },
]);
const value = ref("");
</script>

<template>
  <er-select v-model="value" :options="options" clearable />
</template>
