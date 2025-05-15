<script setup>
import { ref, computed } from 'vue';
import { ElDivider } from 'element-plus';
import { setGameData } from '@/utils/gameData';

const difficulty = ref('easy');
const attr1 = ref(0);
const attr2 = ref(0);
const attr3 = ref(0);
const attr4 = ref(0);
const userName = ref('');
const userDescription = ref('');


const getTotalPoints = () => {
    if (difficulty.value === 'easy') return 20;
    if (difficulty.value === 'normal') return 10;
    return 5; // hard
};

const maxPoints = computed(() => {
    return getTotalPoints();
});

const remainingPoints = computed(() => {
    const totalAllocated = attr1.value + attr2.value + attr3.value;
    return maxPoints.value - totalAllocated;
});

// 当滑块的值改变时的处理函数
const handleSliderChange = () => {
    let totalAllocated = attr1.value + attr2.value + attr3.value + attr4.value;

    // 确保总和不超过最大值，并自动调整
    if (totalAllocated > maxPoints.value) {
        var excess = totalAllocated - maxPoints.value;

        // 根据属性先后顺序进行调整
        if (attr1.value > 0) {
            if (attr1.value - excess >= 0) {
                attr1.value -= excess;
            } else {
                excess -= attr1.value;
                attr1.value = 0;
            }
        }
        if (excess > 0 && attr2.value > 0) {
            if (attr2.value - excess >= 0) {
                attr2.value -= excess;
            } else {
                excess -= attr2.value;
                attr2.value = 0;
            }
        }
        if (excess > 0 && attr3.value > 0) {
            attr3.value -= excess;
        }
        if (excess > 0 && attr4.value > 0) {
            attr4.value -= excess;
        }
    }
};
const emit = defineEmits(['switchView']);

function onClick(){
    setGameData({
        initConfig: {
            difficulty: difficulty.value,
            wise: attr1.value,
            health: attr2.value,
            family: attr3.value,
            luck: attr4.value,
            userName: userName.value,
            userDescription: userDescription.value
        }, 
        years: [],
        gameRuntime: {
            year: 0,
            event: [],
            status: {
                wise: attr1.value,
                health: attr2.value,
                family: attr3.value,
                luck: attr4.value
            }
        }
    });
    

    emit('switchView', 'gameView')
}

</script>
<template>
    <div class="mt-5 px-4">
    <el-card class="w-full max-w-xl mx-auto"> <!-- 使用百分比 -->
       
            <div class="card-header">
                <h1 class="text-3xl">游戏初始化~</h1>
            </div>
      
        <p>选择游戏难度</p>
        <el-radio-group v-model="difficulty" size="large">
            <el-radio-button label="简单" value="easy" />
            <el-radio-button label="普通" value="normal" />
            <el-radio-button label="困难" value="hard" />
        </el-radio-group>
        <p v-if="difficulty === 'easy'" class="text-gray-500 text-xs">你有20可分配的属性点 不会触发厄灾事件</p>
        <p v-if="difficulty === 'normal'" class="text-gray-500 text-xs">你有10可分配的属性点 会触发厄灾事件</p>
        <p v-if="difficulty === 'hard'" class="text-gray-500 text-xs">你有5可分配的属性点 经常触发厄灾事件</p>
        <el-divider></el-divider>

        <p>属性点分配( {{ remainingPoints }} 剩余)</p>

        <div class="attribute-container">
            <div class="attribute-item">
                <label>智力 {{ attr1 }}</label>
                <el-slider v-model="attr1" :min="0" :max="maxPoints" @change="handleSliderChange" />
            </div>
            <div class="attribute-item">
                <label>健康 {{ attr2 }}</label>
                <el-slider v-model="attr2" :min="0" :max="maxPoints" @change="handleSliderChange" />
            </div>
            <div class="attribute-item">
                <label>家庭 {{ attr3 }}</label>
                <el-slider v-model="attr3" :min="0" :max="maxPoints" @change="handleSliderChange" />
            </div>
            <div class="attribute-item">
                <label>幸运 {{ attr4 }}</label>
                <el-slider v-model="attr4" :min="0" :max="maxPoints" @change="handleSliderChange" />
            </div>
        </div>

        <el-divider/>
        <el-input
            v-model="userName"
            placeholder="请输入你的名字"
            class="w-full"
            input-class="rounded-lg"
        ></el-input>
        <el-input
            v-model="userDescription"
            type="textarea"
            placeholder="来一段咒语吧~"
            class="w-full"
            input-class="rounded-lg"
        ></el-input>
        <el-button type="primary" class="w-full" @click="onClick">开始新游戏! ->
        </el-button>
        <el-button type="text" class="w-full" @click="$emit('switchView', 'gameView')">从存档开始 ->
        </el-button>
    </el-card>
    </div>
</template>

<style scoped>

</style>