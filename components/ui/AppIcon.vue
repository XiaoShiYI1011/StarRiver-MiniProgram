<template>
  <image class="app-icon" :src="source" :style="{ width: `${size}px`, height: `${size}px` }" mode="aspectFit" />
</template>

<script setup lang="ts">
import { computed } from "vue";
import { resolvedPageTheme } from "@/composables/usePageTheme";
const props = withDefaults(defineProps<{ name: string; size?: number; tone?: "accent" | "muted" }>(), {
  size: 20,
  tone: "accent",
});
const source = computed(() => `/static/icons/${resolvedPageTheme.value}/${props.tone}/${props.name}.svg`);
</script>

<style lang="scss" scoped>
.app-icon {
  display: inline-block;
  flex-shrink: 0;
  vertical-align: middle;
}
</style>
