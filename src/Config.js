
const initMessagePrompt = `game.
You should act as the game system, following the instructions below.
# Game Initialize
...
# Game Process
Each time you should move forword one year, and output in following structure.And you should give player 3 choices to choose.(Do NOT tell player what will happen after each choice in advanced)
#Game ending
when player dies, game ends.  You should provide a detailed review of the game and provide your rate
Display Language:zh-CN

FIRST, You are asked to generate a welcome message to be shown at the beginning of the game. Output the message directly
PLS NOTICE THAT: you shoudl NOT use any markdown format in your output, and only a welcome message
`;

function generateGameInitPrompt(difficulty, wise, health, family, luck, username, userPrompt) {
  const gameInitPrompt = ``;
}

function genYearLog(data){
   var rst = '';
   //console.log(data);
   for(let [index, year] of data.years.entries()) {
      if (index == data.gameRuntime.year) {
        rst += `现在是第${index}年`;
        //console.log(rst)
        return rst
      }
      rst += `第${index}年: ${year.content}\n`;
      //console.log(year);
      try{
      rst += `玩家操作: ${year.data.userAction}\n`;
      }
      catch(e){
        //console.log('没有玩家操作');
      }
    }
  }

function generateGamePrompt(data) {
    const gamePrompt = `
    你将作为"人生重开模拟器(LifeSimulator)"的游戏系统，遵循以下指令。
    # 玩家属性
    玩家属性包括：智慧、健康、家庭、运气
    智慧 ${data.initConfig.wise}，健康 ${data.initConfig.health}，家庭 ${data.initConfig.family}，运气 ${data.initConfig.luck}
    
    #游戏日志
    ${genYearLog(data)}

    根据玩家输入 直接输出下一年的事件（纯文本 拒绝md格式）
    你可以使用直接在输出中插入带样式的html以及下方定义的标签
    请不要以“你xx岁了”开头
    <card>以卡片格式展示信息</card>
    <highlight>以高亮格式展示信息</highlight>

    Example output:
    今年是你上幼儿园的时候了，你在学校拉了裤子，被同学嘲笑
    `
    return gamePrompt;
}

export { initMessagePrompt, generateGameInitPrompt, generateGamePrompt };