<script setup lang="ts">
// 简化的键盘组件
defineProps<{
  highlightKey?: string
}>()
</script>

<template>
  <div class="keyboard">
    <!-- Row 1 -->
    <div class="row">
      <div class="key">`</div>
      <div class="key">1</div>
      <div class="key">2</div>
      <div class="key">3</div>
      <div class="key">4</div>
      <div class="key">5</div>
      <div class="key">6</div>
      <div class="key">7</div>
      <div class="key">8</div>
      <div class="key">9</div>
      <div class="key">0</div>
      <div class="key">-</div>
      <div class="key">=</div>
      <div class="key wide">⌫</div>
    </div>
    <!-- Row 2 -->
    <div class="row">
      <div class="key wide">Tab</div>
      <div class="key">Q</div>
      <div class="key">W</div>
      <div class="key">E</div>
      <div class="key">R</div>
      <div class="key">T</div>
      <div class="key">Y</div>
      <div class="key">U</div>
      <div class="key">I</div>
      <div class="key">O</div>
      <div class="key">P</div>
      <div class="key">[</div>
      <div class="key">]</div>
      <div class="key">\</div>
    </div>
    <!-- Row 3 -->
    <div class="row">
      <div class="key wide">Caps</div>
      <div class="key">A</div>
      <div class="key">S</div>
      <div class="key">D</div>
      <div class="key">F</div>
      <div class="key">G</div>
      <div class="key">H</div>
      <div class="key">J</div>
      <div class="key">K</div>
      <div class="key">L</div>
      <div class="key">;</div>
      <div class="key">'</div>
      <div class="key wide">Enter</div>
    </div>
    <!-- Row 4 -->
    <div class="row">
      <div class="key wide">Shift</div>
      <div class="key">Z</div>
      <div class="key">X</div>
      <div class="key">C</div>
      <div class="key">V</div>
      <div class="key">B</div>
      <div class="key">N</div>
      <div class="key">M</div>
      <div class="key">,</div>
      <div class="key">.</div>
      <div class="key">/</div>
      <div class="key extra-wide">Shift</div>
    </div>
    <!-- Row 5 -->
    <div class="row">
      <div class="key">Ctrl</div>
      <div class="key">Win</div>
      <div class="key">Alt</div>
      <div class="key extra-wide">Space</div>
      <div class="key">Alt</div>
      <div class="key">Win</div>
      <div class="key">Ctrl</div>
    </div>
  </div>
</template>

<style>
.keyboard {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px;
  background: var(--color-card);
  border-radius: 12px;
  max-width: 800px;
  margin: 0 auto;
}
.row {
  display: flex;
  gap: 6px;
  justify-content: center;
}
.key {
  min-width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  background: var(--color-key-bg);
  border: 1px solid var(--color-key-border);
  color: var(--color-text);
  font-size: 14px;
  font-weight: 500;
}
.key.wide {
  min-width: 60px;
}
.key.extra-wide {
  min-width: 80px;
}
</style>
