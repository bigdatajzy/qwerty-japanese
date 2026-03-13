<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  word: string
  kana: string
  isCurrent?: boolean
  isCorrect?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isCurrent: false,
  isCorrect: false
})

const classes = computed(() => {
  const base = 'ruby-base'
  if (props.isCurrent) return `${base} current`
  if (props.isCorrect) return `${base} correct`
  return base
})
</script>

<template>
  <span class="ruby-container" :class="{ 'ruby-current': isCurrent, 'ruby-correct': isCorrect }">
    <span class="ruby-text">{{ kana }}</span>
    <span :class="classes">{{ word }}</span>
  </span>
</template>

<style scoped>
.ruby-container {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  line-height: 1.3;
  margin: 0 2px;
  vertical-align: text-bottom;
}

.ruby-text {
  font-size: 0.4em;
  color: #6366f1;
  line-height: 1.2;
  white-space: nowrap;
}

.ruby-base {
  font-size: 1em;
  color: var(--color-text);
}

.ruby-current .ruby-text {
  color: #ffffff;
  background-color: #6366f1;
  padding: 0 2px;
  border-radius: 2px;
}

.ruby-current .ruby-base {
  background-color: #6366f1;
  color: #ffffff;
  padding: 0 1px;
  border-radius: 2px;
}

.ruby-correct .ruby-base {
  color: #22c55e;
}

.ruby-correct .ruby-text {
  color: #22c55e;
}
</style>
