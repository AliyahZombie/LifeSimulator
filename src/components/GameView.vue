<template>
  <div class="w-full h-screen">
    <ChatView
      v-for="year in localGameData.years"
      :key="year.id"                            
      :rawIndex="year.index"
      :stream="year.index === localGameData.gameRuntime.year && stream ? stream : null"
      :content="year.index !== localGameData.gameRuntime.year ? year.content : undefined"
      :data="year.data"
      @retry="processYear(true)"
      @button-click="handleClick"
    />
  </div>
</template>

<script setup>
import { ref, watchEffect } from 'vue';
import { getGameData, setGameData } from '@/utils/gameData';
import ChatView from './ChatView.vue';
import { getModelInstance, readConfig } from '@/utils/ModelFactory';
import { generateGamePrompt } from '@/Config';

/* ---------- 响应式全局数据 ---------- */
const localGameData = ref(JSON.parse(JSON.stringify(getGameData())));
const stream = ref('');

/* 持久化：数据一改动就写回 localStorage */
watchEffect(() => {
  setGameData(localGameData.value);
});

/* ---------- 工具函数 ---------- */
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/* 生成唯一年份对象 */
function newYear({ content = '', data = {} } = {}) {
  return {
    id: crypto.randomUUID?.() || Date.now().toString(36) + Math.random().toString(36).slice(2),
    index: localGameData.value.years.length,
    content,
    data,
  };
}

/* ---------- 首次初始化 ---------- */
if (localGameData.value.years.length === 0) {
  const gender = getRandomInt(0, 1) ? 'male' : 'female';
  localGameData.value.initConfig.gender = gender;
  localGameData.value.years.push(
    newYear({
      content: `你出生了, 是个${gender === 'male' ? '男孩' : '女孩'}`,
      data: { userAction: '' },
    }),
  );
  localGameData.value.gameRuntime.year = 1;
}

/* ---------- 核心流程 ---------- */
function handleClick(action,args) {
  if (action === 'retry') {
    processYear(true);
  } else if (action === 'choice') {
    processYear(false, args);
  }
}

async function processYear(retry = false, action= null) {
  if (retry) {
    // 删除当前这一年，回退指针
    const cur = localGameData.value.gameRuntime.year - 1;
    localGameData.value.years.splice(cur, 1);
    localGameData.value.gameRuntime.year = cur;
  }
  if (action) {
    // 处理用户行为
    const cur = localGameData.value.gameRuntime.year - 1;
    localGameData.value.years[cur].data.userAction = action;
  }

  /* 占位，让 ChatView 立即出现 */
  localGameData.value.years.push(
    newYear({
      content: '',
      data: { userAction: '' },
    }),
  );

  /* 生成文案 */
  const model = await getModelInstance(readConfig());
  const gamePrompt = generateGamePrompt(JSON.parse(JSON.stringify(localGameData.value)));
  const modelStream = await model.stream(gamePrompt);

  const chunks = [];
  for await (const chunk of modelStream) {
    chunks.push(chunk.content);
    stream.value = chunks.join('');
  }

  /* 写入结果 */
  const lastYear = localGameData.value.years.at(-1);
  lastYear.content = stream.value;
  stream.value = '';
  localGameData.value.gameRuntime.year = lastYear.index + 1;
}

/* 提供给父组件的接口 */
defineExpose({ processYear });
</script>
