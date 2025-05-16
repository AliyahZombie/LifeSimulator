<template>
  <div class="flex justify-center py-4">
    <!-- 卡片容器 -->
    <div class="w-11/12 bg-white shadow-md rounded-lg p-4 overflow-hidden relative"
    @click="handleInnerClick"
    >
      <!-- 重试按钮 -->
      <button
        @click="$emit('retry',rawIndex)"
        class="absolute top-2 right-2 text-gray-400 hover:text-gray-600 focus:outline-none"
        title="重新尝试"
      >
        <!-- 简单的重载箭头 icon (Heroicons refresh) -->
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v6h6M20 20v-6h-6M4.93 19.07A10 10 0 0112 2.05 10 10 0 0119.07 12M19.07 12H12" />
        </svg>
      </button>

      <!-- 索引 -->
      <p class="text-gray/20">Year: {{ rawIndex }}</p>

      <!-- 主内容 -->
      <div v-html="formattedContent" class="whitespace-pre-wrap"></div>

      <!-- 用户操作区域 -->
      <div
        v-if="userActionContent"
        v-html="userActionContent"
        class="mt-4 pt-3 border-t border-dashed border-gray-200 text-gray-500 text-sm italic whitespace-pre-wrap"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount, computed } from 'vue';
import DOMPurify from 'dompurify';

// props 定义
const props = defineProps({
  /** 父组件实时传入的流内容（优先级最高） */
  stream: {
    type: String,
    default: null,
  },
  /** 静态内容（当 stream 为空时使用） */
  content: {
    type: String,
    default: '',
  },
  /** 卡片左上角展示的索引 */
  rawIndex: {
    type: Number,
    default: 0,
  },
  /** 额外数据，用于展示用户操作等信息 */
  data: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(['retry', 'button-click']);

/* =====================
 *  状态 & 常量
 * ===================== */
const internalContent = ref('');   // 目标文本（随流增长）
const displayContent   = ref('');  // 已渲染文本
const typingSpeed      = 20;       // 打字速度 (ms/char)
let   typingTimerId    = null;     // 定时器 ID

DOMPurify.addHook('uponSanitizeAttribute', (node, data) => {
  if (data.attrName === 'data-action' || data.attrName === 'data-args') {
    data.keepAttr = true;
  }
});

/* =====================
 *  辅助函数
 * ===================== */
function formatSpecialContent(text) {
  return text
    .replace(/<card>/g,      '<div class="bg-gray-100 border border-gray-300 rounded p-2 my-2">')
    .replace(/<\/card>/g,    '</div>')
    .replace(/<highlight>/g, '<span class="bg-yellow-300">')
    .replace(/<\/highlight>/g, '</span>')
    .replace(/<button /g, '<button class="w-full hover:bg-blue-300 transition-colors bg-blue-100 m-2 rounded-2xl"')
    .replace(/<\/button>/g, '</button>');
}

function startTyping() {
  if (typingTimerId) return; // 已在打字

  const step = () => {
    const target = formatSpecialContent(internalContent.value);
    if (displayContent.value.length < target.length) {
      displayContent.value = target.slice(0, displayContent.value.length + 1);
      typingTimerId = setTimeout(step, typingSpeed);
    } else {
      typingTimerId = null; // 完成
    }
  };
  step();
}

/* =====================
 *  监听 stream / content 变化
 * ===================== */
watch(
  () => props.stream ?? props.content,
  (newVal, oldVal) => {
    if (newVal === oldVal) return;

    // 如果使用流，并且之前没有流，则重置显示文本
    if (props.stream && oldVal === null) {
      displayContent.value = '';
    }

    internalContent.value = newVal ?? '';
    startTyping();
  },
  { immediate: true }
);

// ③：事件委托函数
function handleInnerClick(event) {
  const btn = event.target.closest('button[data-action]');
  if (!btn) return;
  const action = btn.dataset.action;
  const args = btn.dataset.args
  emit('button-click', action, args);
}

/* =====================
 *  计算属性
 * ===================== */
const formattedContent = computed(() => DOMPurify.sanitize(displayContent.value));
const userActionContent = computed(() => DOMPurify.sanitize(props.data?.userAction || ''));

/* =====================
 *  生命周期
 * ===================== */
onMounted(() => {
  // 若组件初始就有静态内容
  if (!props.stream && props.content) {
    internalContent.value = props.content;
    displayContent.value = formatSpecialContent(internalContent.value);
  }
});

onBeforeUnmount(() => {
  if (typingTimerId) clearTimeout(typingTimerId);
});
</script>

<style scoped>
/* 可在此处添加额外样式 */
</style>

