<script setup>
import { ElMessage, ElMessageBox } from 'element-plus';
import { ref, toRaw, markRaw } from 'vue';
import WelcomeView from './components/WelcomeView.vue';
import InitSettingView from './components/InitSettingView.vue';
import SettingDialog from './components/SettingDialog.vue';
import { setGameData, getGameData, clearGameData, addAYear,setUserInputCurrentYear } from './utils/gameData';
import GameView from './components/GameView.vue';

const settingVisible = ref(false);
const userInput = ref('');
const viewRef = ref();

// settings handler
function settings() {
  settingVisible.value = !settingVisible.value;
}

function debug() {
  // addAYear({
  //   content: 'Test message',
  //   data: {},
  // });
  ElMessageBox.alert(JSON.stringify(toRaw(getGameData()), null, 2), 'Debug Info', {
    confirmButtonText: 'OK',
    type: 'info',
  });
}

const views = {
  welcome: markRaw(WelcomeView),
  initSetting: markRaw(InitSettingView),
  gameView: markRaw(GameView),
};
const currentView = ref(views.welcome);

const getViewClass = (view) => {
  switch (view) {
    case views.welcome:
      return 'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2';
    case views.initSetting:
      return 'w-full flex justify-center mt-6';
    default:
      return '';
  }
};

const switchView = (viewName) => {
  currentView.value = views[viewName];
};

const handleUserInput = () => {
  if (userInput.value.trim() === '') {
    return;
  }

  // 处理用户输入
  const input = userInput.value.trim();
  console.log('User input:', input);
  userInput.value = '';
  // setUserInputCurrentYear(input);
  console.log('Game data after user input:', getGameData());
  console.log(viewRef.value);
  viewRef.value?.processYear(false, input);
  
}

</script>

<template>
  <!-- 整页采用 flex 垂直布局 -->
  <div class="h-screen flex flex-col">
    <!-- 顶栏 -->
    <header
      class="fixed top-0 left-0 w-full bg-white/30 p-2.5 flex items-center shadow-md z-50 backdrop-blur-md"
    >
      <img
        alt="Vue logo"
        class="mr-4"
        src="./assets/logo.svg"
        width="50"
        height="50"
        @click="debug"
      />
      <h1 class="text-xl font-semibold m-0">人生重开模拟器 - LifeSimulator</h1>
      <el-button class="ml-auto" type="primary" icon="Setting" circle @click="settings" />
    </header>

    <!-- 主内容：flex-1 自动撑开，overflow-y-auto 只保留这一处滚动条 -->
    <main
      class="flex-1 overflow-y-auto relative bg-blue-100 pt-[72px] pb-[80px]"
      
    >
      <component
        :is="currentView"
        :class="getViewClass(currentView)"
        ref="viewRef"
        @switchView="switchView"
      />
    </main>

    <!-- 底部输入框：放在文档流中，占位不会遮挡 -->
    <div v-if="currentView === views['gameView']" class="p-2 bg-white shadow-inner flex flex-row">
      <el-input class="w-full" input-class="rounded-lg" v-model="userInput" />
      <el-button
        class="flex-1"
        type="primary"
        icon="Top"

        @click="handleUserInput"
      />
    </div>

    <!-- 设置弹窗 -->
    <SettingDialog v-model="settingVisible" />
  </div>
</template>

<style scoped>
/* 如果仍想在移动端使用惯性滚动，可保留这一段 */
main {
  -webkit-overflow-scrolling: touch;
}
</style>
