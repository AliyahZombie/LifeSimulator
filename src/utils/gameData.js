// src/utils/gameData.js

// 设置 gameData
export function setGameData(newGameData) {
  localStorage.setItem('gameData', JSON.stringify(newGameData));
}

// 获取 gameData
export function getGameData() {
  const gameData = localStorage.getItem('gameData');
  return gameData ? JSON.parse(gameData) : {};
}

// 清除 gameData
export function clearGameData() {
  localStorage.removeItem('gameData');
}

export function addAYear(data) {
  const gameData = getGameData();
  gameData.years.push(data);
  setGameData(gameData);
}

export function setUserInputCurrentYear(input) {
  const gameData = getGameData();
  var current = gameData.gameRuntime.year-1;
  gameData.years[current].data.userAction = input;
  setGameData(gameData);
}



// {
//         initConfig: {
//             difficulty: difficulty.value,
//             wise: attr1.value,
//             health: attr2.value,
//             family: attr3.value,
//             luck: attr4.value,
//             userName: userName.value,
//             userDescription: userDescription.value
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