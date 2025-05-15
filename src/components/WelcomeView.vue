<script setup>
import { ref } from 'vue';
import { defineEmits } from 'vue';
import { readConfig,getModelInstance } from '../utils/ModelFactory.js';
import {initMessagePrompt} from "../Config.js";
const welcomeMessage = ref("Generating welcome message...");
const welcomeMessageLoading = ref(false);

const emit = defineEmits(['switchView']);

async function init() {

  const stream = await (await getModelInstance(readConfig())).stream(initMessagePrompt)
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk.content);
    welcomeMessage.value = chunks.join('');
  }
  welcomeMessageLoading.value = false;

}

init();



function onClick() {
  emit('switchView', 'initSetting');
}

</script>


<template>
    
    <el-card style="max-width: 480px">
    <template #header>
      <div class="card-header">
        <h1>Welcome To 人生重开模拟器🎉</h1>
      </div>
    </template>
    <el-text v-loading="welcomeMessageLoading">
        {{ welcomeMessage }}
    </el-text>
    <el-button type="primary" class="w-full" @click="onClick">
        Start! ->
    </el-button>
    <!-- <template #footer>Footer content</template> -->
  </el-card>


</template>