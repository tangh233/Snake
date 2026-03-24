# Implementation Plan: 贪吃蛇游戏（Snake Game）

## 概述

基于 HTML5 Canvas 和原生 JavaScript 实现经典贪吃蛇游戏。项目为全新空工程，最终交付 `index.html`、`game.js`、`renderer.js` 三个文件，以及使用 Jest + fast-check 的测试套件。按照模块化架构，先搭建项目结构和常量配置，再实现核心游戏逻辑，然后实现渲染模块，最后集成并完成页面入口。

## Tasks

- [x] 1. 搭建项目结构与基础配置
  - [x] 1.1 创建项目目录结构和配置文件
    - 初始化 `package.json`，添加 Jest 和 fast-check 依赖
    - 配置 Jest 测试环境（jsdom）
    - 创建 `game.js`、`renderer.js`、`index.html` 骨架文件
    - 在 `game.js` 中定义 `CONFIG`、`GameState`、`Direction` 常量
    - _Requirements: 1.1, 2.6_

- [x] 2. 实现 Game 核心逻辑
  - [x] 2.1 实现 Game 类的构造函数和 reset 方法
    - 创建 `Game` 类，构造函数接收 canvas 和 renderer
    - 实现 `reset()` 方法：初始化蛇（长度 3，画布中央）、分数归零、状态设为 WAITING、生成食物
    - _Requirements: 1.2, 1.3, 1.4, 5.2_

  - [ ]* 2.2 编写属性测试：重置恢复初始状态
    - **Property 9: 重置恢复初始状态**
    - 生成随机游戏状态，调用 reset，验证蛇长度为 3、分数为 0、状态为 WAITING、食物在有效位置
    - **Validates: Requirements 5.2**

  - [x] 2.3 实现 changeDirection 方向控制方法
    - 实现方向键到方向向量的映射
    - 实现 180 度反向输入校验，反向时返回 false 且不改变方向
    - 使用 `nextDirection` 缓冲防止同一 tick 多次转向
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [ ]* 2.4 编写属性测试：方向键映射与反向忽略
    - **Property 1: 方向键映射正确**
    - 生成随机有效方向，验证 `changeDirection` 后 `nextDirection` 正确
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.4**
    - **Property 2: 反向输入被忽略**
    - 生成随机方向对，验证反向被拒绝且 `nextDirection` 不变
    - **Validates: Requirements 2.5**

  - [x] 2.5 实现 moveSnake 蛇移动逻辑
    - 根据当前方向计算新头部坐标
    - 将新头部插入蛇身数组头部
    - 未吃到食物时移除尾部，吃到食物时保留尾部（蛇变长）
    - _Requirements: 2.6_

  - [ ]* 2.6 编写属性测试：蛇沿方向移动一格
    - **Property 3: 蛇沿方向移动一格**
    - 生成随机蛇位置和方向，验证新蛇头 = 旧蛇头 + 方向向量
    - **Validates: Requirements 2.6**

  - [x] 2.7 实现碰撞检测方法
    - 实现 `checkWallCollision(head)`：坐标超出 `[0, GRID_COUNT-1]` 范围返回 true
    - 实现 `checkSelfCollision(head)`：头部与蛇身（不含头部）重叠返回 true
    - 实现 `checkFoodCollision(head)`：头部与食物位置相同返回 true
    - _Requirements: 4.1, 4.2_

  - [ ]* 2.8 编写属性测试：碰撞检测
    - **Property 6: 墙壁碰撞检测**
    - 生成随机坐标，验证 `checkWallCollision` 当且仅当坐标越界时返回 true
    - **Validates: Requirements 4.1**
    - **Property 7: 自身碰撞检测**
    - 生成随机蛇身和头部位置，验证 `checkSelfCollision` 正确判定
    - **Validates: Requirements 4.2**

  - [x] 2.9 实现 spawnFood 食物生成和食物碰撞得分逻辑
    - 收集蛇占据的所有坐标，从未占据位置中随机选择
    - 吃到食物时分数 +10，蛇长度 +1，生成新食物
    - _Requirements: 1.3, 3.1, 3.2, 3.3_

  - [ ]* 2.10 编写属性测试：食物生成与得分
    - **Property 5: 食物生成在有效且未被占据的位置**
    - 生成随机蛇身，验证食物坐标在有效范围内且不与蛇重叠
    - **Validates: Requirements 1.3, 3.3**
    - **Property 4: 吃食物后分数增加且蛇变长**
    - 生成随机游戏状态，模拟吃食物，验证分数 +10 且蛇长度 +1
    - **Validates: Requirements 3.1, 3.2**

  - [x] 2.11 实现 tick 游戏主循环和 start/stop 方法
    - `tick()`：应用 nextDirection → moveSnake → 碰撞检测 → 食物检测 → 渲染
    - `start()`：设置 setInterval 以 150ms 间隔调用 tick
    - `stop()`：清除 interval，状态设为 GAME_OVER
    - _Requirements: 2.6, 4.4_

  - [ ]* 2.12 编写属性测试：碰撞后游戏状态转换
    - **Property 8: 碰撞后游戏状态转换**
    - 生成碰撞场景，验证 tick 后游戏状态变为 GAME_OVER
    - **Validates: Requirements 4.4**

  - [x] 2.13 实现 handleKeydown 键盘事件处理
    - WAITING 状态下按方向键：调用 changeDirection 并 start
    - PLAYING 状态下按方向键：调用 changeDirection
    - GAME_OVER 状态下按空格键：调用 reset 并渲染
    - 忽略其他无关按键
    - _Requirements: 1.5, 2.1, 2.2, 2.3, 2.4, 5.1, 5.2_

- [x] 3. Checkpoint - 确保游戏核心逻辑完整
  - 确保所有测试通过，如有问题请向用户确认。

- [x] 4. 实现 Renderer 渲染模块
  - [x] 4.1 实现 Renderer 类及所有绘制方法
    - 实现 `clear()`：清除画布
    - 实现 `drawGrid()`：绘制网格边界线
    - 实现 `drawSnake(snake)`：蛇头和蛇身使用不同颜色绘制
    - 实现 `drawFood(food)`：绘制食物方块
    - 实现 `drawScore(score)`：在画布上绘制分数
    - 实现 `drawMessage(text)`：绘制提示文字（开始提示/游戏结束）
    - 实现 `render(gameState)`：根据游戏状态调用各绘制方法完成一帧渲染
    - _Requirements: 3.4, 4.3, 6.1, 6.2, 6.3, 6.4_

  - [ ]* 4.2 编写 Renderer 单元测试
    - Mock Canvas 2D Context API
    - 验证各绘制方法正确调用 Canvas API
    - 验证 render 方法根据不同游戏状态调用正确的绘制组合
    - _Requirements: 6.1, 6.2, 6.3_

- [x] 5. 创建页面入口并集成所有模块
  - [x] 5.1 完成 index.html 页面结构与样式
    - 创建 400×400 Canvas 元素
    - 页面居中布局，深色背景
    - 显示游戏标题"贪吃蛇"
    - 显示操作说明（方向键控制、空格键重新开始）
    - 引入 renderer.js 和 game.js（注意加载顺序）
    - _Requirements: 1.1, 1.5, 7.1, 7.2, 7.3, 7.4_

  - [x] 5.2 在 game.js 中添加入口初始化代码
    - 页面加载完成后获取 Canvas 元素
    - 创建 Renderer 和 Game 实例
    - 绑定键盘事件监听器
    - 调用 reset 和初始渲染
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 6. Final Checkpoint - 确保所有测试通过并完成集成
  - 确保所有测试通过，如有问题请向用户确认。

## Notes

- 标记 `*` 的任务为可选测试任务，可跳过以加快 MVP 交付
- 每个任务引用了对应的需求编号以确保可追溯性
- 属性测试使用 Jest + fast-check，每个属性至少运行 100 次迭代
- 项目无第三方运行时依赖，仅测试依赖 Jest 和 fast-check
