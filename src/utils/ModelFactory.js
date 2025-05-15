import { ChatOpenAI } from "@langchain/openai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { OpenAIClient } from "@langchain/openai";
import { markRaw } from "vue";

function readConfig() {
    let defaultSettings = {
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
    return { ...defaultSettings, ...initial };
}

async function getModelInstance(config) {
    if (config.provider === "openai") {

        var instance = markRaw(new ChatOpenAI({
            model: config.model,
            apiKey: config.api_key,
            baseUrl: config.api_base
        }));
        try { await instance.invoke("hi"); }
        catch (e) {
        }

        console.log(instance);
        console.log(instance.client);
        instance.client.baseURL = config.api_base;
        console.log("OpenAI instance created with base URL:", instance.client.baseURL);
        return instance;
    }
    if (config.provider === "gemini") {
        return new ChatGoogleGenerativeAI({
            model: config.model,
            apiKey: config.api_key,
            baseUrl: config.api_base

        });
    }
}

export { getModelInstance, readConfig };