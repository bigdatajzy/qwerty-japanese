<script setup lang="ts">
// 日式键盘组件
defineProps<{
  highlightKey?: string
}>()
</script>

<template>
  <div class="keyboard">
    <div class="label">日式键盘 (OADG 109A)</div>
    <!-- Row 1 -->
    <div class="row">
      <div class="key"><span>1</span><span class="sub">!</span></div>
      <div class="key"><span>2</span><span class="sub">"</span></div>
      <div class="key"><span>3</span><span class="sub">#</span></div>
      <div class="key"><span>4</span><span class="sub">$</span></div>
      <div class="key"><span>5</span><span class="sub">%</span></div>
      <div class="key"><span>6</span><span class="sub">&amp;</span></div>
      <div class="key"><span>7</span><span class="sub">'</span></div>
      <div class="key"><span>8</span><span class="sub">(</span></div>
      <div class="key"><span>9</span><span class="sub">)</span></div>
      <div class="key"><span>0</span></div>
      <div class="key"><span>-</span><span class="sub">=</span></div>
      <div class="key"><span>^</span><span class="sub">~</span></div>
      <div class="key"><span>¥</span><span class="sub">|</span></div>
      <div class="key wide">⌫</div>
    </div>
    <!-- Row 2 -->
    <div class="row">
      <div class="key wide">Tab</div>
      <div class="key"><span>Q</span><span class="sub">あ</span></div>
      <div class="key"><span>W</span><span class="sub">い</span></div>
      <div class="key"><span>E</span><span class="sub">う</span></div>
      <div class="key"><span>R</span><span class="sub">え</span></div>
      <div class="key"><span>T</span><span class="sub">お</span></div>
      <div class="key"><span>Y</span><span class="sub">か</span></div>
      <div class="key"><span>U</span><span class="sub">き</span></div>
      <div class="key"><span>I</span><span class="sub">く</span></div>
      <div class="key"><span>O</span><span class="sub">け</span></div>
      <div class="key"><span>P</span><span class="sub">こ</span></div>
      <div class="key"><span>@</span><span class="sub">`</span></div>
      <div class="key"><span>[</span><span class="sub">{</span></div>
      <div class="key wide">Enter</div>
    </div>
    <!-- Row 3 -->
    <div class="row">
      <div class="key wide">Caps</div>
      <div class="key"><span>A</span><span class="sub">さ</span></div>
      <div class="key"><span>S</span><span class="sub">し</span></div>
      <div class="key"><span>D</span><span class="sub">す</span></div>
      <div class="key"><span>F</span><span class="sub">せ</span></div>
      <div class="key"><span>G</span><span class="sub">そ</span></div>
      <div class="key"><span>H</span><span class="sub">た</span></div>
      <div class="key"><span>J</span><span class="sub">ち</span></div>
      <div class="key"><span>K</span><span class="sub">つ</span></div>
      <div class="key"><span>L</span><span class="sub">て</span></div>
      <div class="key"><span>;</span><span class="sub">+</span></div>
      <div class="key"><span>:</span><span class="sub">*</span></div>
      <div class="key"><span>]</span><span class="sub">}</span></div>
    </div>
    <!-- Row 4 -->
    <div class="row">
      <div class="key wide">Shift</div>
      <div class="key"><span>Z</span><span class="sub">ざ</span></div>
      <div class="key"><span>X</span><span class="sub">じ</span></div>
      <div class="key"><span>C</span><span class="sub">ず</span></div>
      <div class="key"><span>V</span><span class="sub">ぜ</span></div>
      <div class="key"><span>B</span><span class="sub">ぞ</span></div>
      <div class="key"><span>N</span><span class="sub">だ</span></div>
      <div class="key"><span>M</span><span class="sub">ぢ</span></div>
      <div class="key"><span>,</span><span class="sub">づ</span></div>
      <div class="key"><span>.</span><span class="sub">で</span></div>
      <div class="key"><span>/</span><span class="sub">ど</span></div>
      <div class="key extra-wide">Shift</div>
    </div>
    <!-- Row 5 -->
    <div class="row">
      <div class="key">Ctrl</div>
      <div class="key">Alt</div>
      <div class="key"><span>無</span><span class="sub">変</span></div>
      <div class="key extra-wide">Space</div>
      <div class="key"><span>変</span><span class="sub">換</span></div>
      <div class="key"><span>半</span><span class="sub">角</span></div>
      <div class="key">Alt</div>
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
.label {
  text-align: center;
  font-size: 12px;
  color: var(--color-text-secondary);
  margin-bottom: 4px;
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
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  background: var(--color-key-bg);
  border: 1px solid var(--color-key-border);
  color: var(--color-text);
  font-size: 14px;
  font-weight: 500;
}
.key span {
  line-height: 1.2;
}
.key .sub {
  font-size: 9px;
  opacity: 0.6;
}
.key.wide {
  min-width: 60px;
}
.key.extra-wide {
  min-width: 80px;
}
</style>
