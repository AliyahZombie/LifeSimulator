<template>
  <div class="w-full h-screen">
    <ChatView
  v-for="(year, index) in localGameData.years"
  :key="index"
  :rawIndex="index"
  :stream="index === localGameData.gameRuntime.year && stream ? stream : null"
  :content="index !== localGameData.gameRuntime.year ? year.content : undefined"
  :data="year.data"
  @retry="processYear(true)"
/>

  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted, onUnmounted } from 'vue';
import { getGameData, setGameData, clearGameData, addAYear } from '@/utils/gameData';
import ChatView from './ChatView.vue';
import { getModelInstance, readConfig } from '@/utils/ModelFactory';
import { generateGamePrompt } from '@/Config';

// 创建本地响应式数据
const localGameData = ref(getGameData());
const stream = ref("");

// 创建一个函数来更新本地数据
const updateLocalGameData = () => {
  localGameData.value = getGameData();
};


// render test
if(false)
{addAYear({
  content: '测试消息',
  data: {},
});
addAYear({
  content: '测试卡片渲染<card>测试</card>',
  data: {},
});
addAYear({
  content: '测试高亮渲染<highlight>测试</highlight>',
  data: {},
});
addAYear({
  content: '测试图片渲染<img src="https://example.com/image.jpg" alt="测试图片">',
  data: {},
});
addAYear({
  content: '测试链接渲染<a href="https://example.com">测试链接</a>',
  data: {},
});
addAYear({
  content: '测试不闭合卡片<card>测试',
  data: {},
});
}

// 设置一个定时器来检查gameData的变化
let intervalId;
onMounted(() => {
  // 初始设置
  updateLocalGameData();
  
  // 每100ms检查一次gameData是否有变化
  intervalId = setInterval(updateLocalGameData, 100);
});

onUnmounted(() => {
  // 清除定时器
  clearInterval(intervalId);
});


// {
//         initConfig: {
//             difficulty: difficulty.value,
//             wise: attr1.value,
//             health: attr2.value,
//             family: attr3.value,
//             luck: attr4.value,
//             userName: userName.value,
//             userDescription: userDescription.value,
//             gender: 'male'
//         }, 
//         years: [
//             {
//                 content: 'Test message',
//                 data: {
//                     userAction: '',
//                     
//             },
//            ],
//         gameRuntime: {
//             year: 0,
//             event: [],
//             status: {
//                 wise: attr1.value,
//                 health: attr2.value,
//                 family: attr3.value,
//                 luck: attr4.value
//             }
//         }
//     }
// Structurn Hint

// ===========> Main Game Logic <==========
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// init first game
var gameData = getGameData();


if (gameData.years.length === 0) {
  var gender = getRandomInt(0, 1) === 0 ? 'male' : 'female';
  gameData.initConfig.gender = gender;
    gameData.years.push({
        content: '你出生了, 是个'+(gender == 'male' ? '男孩' : '女孩'),
        data: {
            userAction: '',
        },
    });
    gameData.gameRuntime.year = 1;
    setGameData(gameData);
}


async function processYear(retry = false) {
  if (retry) {
    // 如果是重试，则清除当前年份的内容
    localGameData.value.gameRuntime.year -= 1;
    localGameData.value.years.splice([localGameData.value.gameRuntime.year]);
    setGameData(localGameData.value);
    };
  
  addAYear({
    content: '',
    data: {
        userAction: '',
    },
  });
  var gameData = getGameData();
  localGameData.value = gameData;
  var modelStream = await (await getModelInstance(readConfig())).stream(generateGamePrompt(gameData)); 
  const chunks = [];
  for await (const chunk of modelStream) {
    chunks.push(chunk.content);
    stream.value = chunks.join('');
    console.log(chunk.content);
  }
  gameData.years[gameData.gameRuntime.year].content = stream.value;
  gameData.gameRuntime.year += 1;
  stream.value = '';
  setGameData(gameData);
}

defineExpose({
  processYear,
});



</script>