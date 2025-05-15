<script setup>
import { reactive, defineProps, defineEmits, toRaw, ref } from 'vue';
import {getModelInstance} from '../utils/ModelFactory.js';
import { ElMessage } from 'element-plus';

const props = defineProps({
    modelValue: { type: Boolean, default: false }
});
const emit = defineEmits(['update:modelValue']);

// 1. 全量默认值，保证以后扩字段也不会丢
const defaultSettings = {
    api_base: '',
    api_key: '',
    model: '',
    provider: 'openai'   // 给 provider 一个默认值
};

// 2. 读缓存并合并
let initial = {};
try {
    initial = JSON.parse(localStorage.getItem('api_settings') || '{}');
} catch (e) {
    console.warn('读取 localStorage 失败，使用默认值', e);
}
const form = reactive({ ...defaultSettings, ...initial });

// 3. 关闭对话
function handleClose() {
    emit('update:modelValue', false);
}

// 4. 提交并存储
function submit() {
    // toRaw(form) 拿回最原始的 JS 对象
    localStorage.setItem('api_settings', JSON.stringify(toRaw(form)));
    handleClose();
}

const checkingConnection = ref(false);
// 5. 检查连接性
async function checkConnection() {
    checkingConnection.value = true;
    // setTimeout(() => {
    //     checkingConnection.value = false;
    // }, 2000);
    const modelInstance = await getModelInstance(form);
    try {
        const result = await modelInstance.invoke("Connection test, pls only reply hi");
        ElMessage.success('模型返回结果: ' + result.content);
    } catch (error) {
        ElMessage.error('连接测试失败: ' + error.message);
        console.error('连接测试失败', error);
    }
    checkingConnection.value = false;
    
}
</script>

<template>
    <el-dialog v-loading="checkingConnection" :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)" title="设置" width="80%"
        :close-on-click-modal="false" :close-on-press-escape="true">
        <el-form v-loading="checkingConnection" :model="form" label-width="100px">
            <el-form-item label="API 地址">
                <el-input v-model="form.api_base" />
            </el-form-item>
            <el-form-item label="API 密钥">
                <el-input v-model="form.api_key" type="password" show-password />
            </el-form-item>
            <el-form-item label="模型名称">
                <el-input v-model="form.model" />
            </el-form-item>
            <el-form-item label="模型提供商">
                <el-select v-model="form.provider" placeholder="模型提供商">
                    <el-option label="OpenAI(Experimental-由于Langchain的恶性bug所以使用了奇技淫巧)" value="openai" />
                    <el-option label="Google Gemini" value="gemini" />
                </el-select>
            </el-form-item>
        </el-form>
        <template #footer>
            <el-button @click="handleClose">取消</el-button>
            <el-button type="primary" @click="submit">确认</el-button>
            <el-button type="primary" @click="checkConnection">检查连接性</el-button>

        </template>
    </el-dialog>
</template>