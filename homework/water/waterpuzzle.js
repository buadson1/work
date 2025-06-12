// 當 HTML 完全載入後執行以下程式
document.addEventListener("DOMContentLoaded", () => {
  // 取得主要的 DOM 元素
  const gameContainer = document.getElementById("game-container");
  const playButton = document.getElementById("play-button");
  const levelSelect = document.getElementById("level-select");

  // 定義所有可能使用的顏色
  const colors = [
    "red", "blue", "green", "yellow", "orange", "purple", "pink", "brown",
    "cyan", "magenta", "lime", "teal", "indigo", "violet", "gold", "silver",
    "maroon", "navy", "olive", "coral",
  ];

  const tubes = []; // 用來儲存所有的試管 DOM 元素
  let selectedTube = null; // 用來記錄目前選取的試管
  let levelCount = 1; // 初始關卡數

  // 選擇關卡時更新 levelCount 並顯示在畫面上
  function chooseLevel(level) {
    levelCount = level;
    document.getElementById("level-count").textContent = levelCount;
  }

  // 關卡選單變動時觸發
  levelSelect.addEventListener("change", (event) => {
    const selectedLevel = parseInt(event.target.value, 10);
    chooseLevel(selectedLevel);
  });

  // 檢查遊戲目前狀態，是否有完成關卡
  function checkGameState() {
    // 判斷某個試管是否已經是四格相同顏色
    const allSameColor = (tube) => {
      const waters = Array.from(tube.children);
      return (
        waters.length === 4 &&
        waters.every(
          (water) => water.style.backgroundColor === waters[0].style.backgroundColor
        )
      );
    };

    let completedTubes = 0;
    tubes.forEach((tube) => {
      if (allSameColor(tube)) {
        completedTubes++;
      }
    });

    // 更新已完成試管數
    document.getElementById("completed-tubes-count").textContent = completedTubes;

    // 檢查是否每一管不是空的就是完成的
    if (
      tubes.every((tube) => tube.childElementCount === 0 || allSameColor(tube))
    ) {
      // 通關提示與進入下一關
      if (levelCount === 10) {
        alert("恭喜!你已經完成所有挑戰!!");
      } else {
        alert("你已經完成本關卡!");
        levelCount++;
        document.getElementById("level-count").textContent = levelCount;
        document.getElementById("completed-tubes-count").textContent = 0;
        chooseLevel(levelCount);
        createTubes();
        fillTubes();
      }
    }
  }

  // 倒水邏輯：從 fromTube 把同色水倒入 toTube
  function pourWater(fromTube, toTube) {
    let fromWater = fromTube.querySelector(".water:last-child");
    let toWater = toTube.querySelector(".water:last-child");

    if (!toWater) {
      // 若目標是空試管，則倒入所有連續相同顏色的水
      const color = fromWater ? fromWater.style.backgroundColor : null;
      while (
        fromWater &&
        fromWater.style.backgroundColor === color &&
        toTube.childElementCount < 4
      ) {
        toTube.appendChild(fromWater);
        fromWater = fromTube.querySelector(".water:last-child");
      }
    } else {
      // 若目標試管最上層有水，且顏色一樣，也可倒入
      while (
        fromWater &&
        fromWater.style.backgroundColor === toWater.style.backgroundColor &&
        toTube.childElementCount < 4
      ) {
        toTube.appendChild(fromWater);
        fromWater = fromTube.querySelector(".water:last-child");
        toWater = toTube.querySelector(".water:last-child");
      }
    }

    checkGameState(); // 倒完水後檢查是否完成
  }

  // 點選試管邏輯：第一次點選為選取，再次點選另一個為倒水
  function selectTube(tube) {
    if (selectedTube) {
      if (selectedTube !== tube) {
        pourWater(selectedTube, tube);
      }
      selectedTube.classList.remove("selected");
      selectedTube = null;
    } else {
      selectedTube = tube;
      tube.classList.add("selected");
    }
  }

  // 建立試管元素
  function createTubes() {
    gameContainer.innerHTML = ""; // 清空畫面
    tubes.length = 0;

    // 建立關卡數 + 1 的試管（每種顏色一管）
    for (let i = 0; i < levelCount + 1; i++) {
      const tube = document.createElement("div");
      tube.classList.add("tube");
      tube.addEventListener("click", () => selectTube(tube));
      gameContainer.appendChild(tube);
      tubes.push(tube);
    }

    // 再新增兩個空的試管供緩衝使用
    for (let i = 0; i < 2; i++) {
      const emptyTube = document.createElement("div");
      emptyTube.classList.add("tube");
      emptyTube.addEventListener("click", () => selectTube(emptyTube));
      gameContainer.appendChild(emptyTube);
      tubes.push(emptyTube);
    }
  }

  // 將水顏色填入試管中
  function fillTubes() {
    // 取得要用的顏色數量（關卡數 + 1 種）
    const gameColors = colors.slice(0, Math.min(levelCount + 1, colors.length));
    const waterBlocks = [];

    // 每種顏色建立 4 個水塊
    gameColors.forEach((color) => {
      for (let i = 0; i < 4; i++) {
        waterBlocks.push(color);
      }
    });

    // 將所有顏色順序打亂
    waterBlocks.sort(() => 0.5 - Math.random());

    // 將水塊均勻分配到每個試管中
    let blockIndex = 0;
    tubes.slice(0, levelCount + 1).forEach((tube) => {
      for (let i = 0; i < 4; i++) {
        if (blockIndex < waterBlocks.length) {
          const water = document.createElement("div");
          water.classList.add("water");
          water.style.backgroundColor = waterBlocks[blockIndex];
          water.style.height = "20%"; // 水塊高度設為20%
          tube.appendChild(water);
          blockIndex++;
        }
      }
    });
  }

  // 點擊開始按鈕後建立新遊戲
  playButton.addEventListener("click", () => {
    tubes.length = 0;
    createTubes();
    fillTubes();
  });
});
