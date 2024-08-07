<script setup>
import { ref } from "vue";

const options = ref([
  { value: "beijing", label: "Beijing" },
  { value: "shanghai", label: "Shanghai" },
  { value: "shenzhen", label: "Shenzhen", disabled: true },
  { value: "hangzhou", label: "Hangzhou" },
]);
const value = ref("");
</script>

<template>
  <er-select v-model="value" filterable clearable>
    <er-option value="beijing" label="Beijing" />
    <er-option value="shanghai" label="Shanghai" />
    <er-option value="shenzhen" label="Shenzhen" disabled />
    <er-option value="hangzhou" label="Hangzhou" />
  </er-select>
</template>
