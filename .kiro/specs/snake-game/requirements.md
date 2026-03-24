# Requirements Document

## Introduction

本文档定义了一个基于浏览器的经典贪吃蛇游戏（Snake Game）的功能需求。该游戏使用 HTML5 Canvas 和原生 JavaScript 实现，玩家通过键盘方向键控制蛇的移动方向，吃到食物后蛇身变长、分数增加，碰到墙壁或自身则游戏结束。

## Glossary

- **Game（游戏）**: 贪吃蛇游戏应用的整体系统
- **Snake（蛇）**: 游戏中由玩家控制的移动实体，由一系列连续的方块组成
- **Food（食物）**: 游戏画布上随机出现的可被蛇吃掉的目标方块
- **Canvas（画布）**: 用于渲染游戏画面的 HTML5 Canvas 元素
- **Grid（网格）**: 将画布划分为等大小方块的逻辑坐标系统
- **Direction（方向）**: 蛇的移动方向，包括上、下、左、右四个方向
- **Score（分数）**: 记录玩家当前吃到食物数量的计数器
- **Game_Loop（游戏循环）**: 以固定时间间隔更新游戏状态并重新渲染画面的循环机制
- **Renderer（渲染器）**: 负责将游戏状态绘制到 Canvas 上的模块

## Requirements

### Requirement 1: 游戏初始化

**User Story:** As a 玩家, I want 打开页面后看到一个完整的游戏界面, so that 我可以立即开始游戏。

#### Acceptance Criteria

1. THE Game SHALL 在页面加载完成后渲染一个固定大小的 Canvas 画布（400×400 像素，网格单元为 20×20 像素）
2. THE Game SHALL 在画布中央显示初始长度为 3 个方块的 Snake
3. THE Game SHALL 在画布上随机位置生成一个 Food
4. THE Game SHALL 在画布上方或下方显示当前 Score，初始值为 0
5. THE Game SHALL 显示"按任意方向键开始游戏"的提示文字

### Requirement 2: 蛇的移动控制

**User Story:** As a 玩家, I want 使用键盘方向键控制蛇的移动方向, so that 我可以引导蛇去吃食物。

#### Acceptance Criteria

1. WHEN 玩家按下上方向键, THE Game SHALL 将 Snake 的移动方向设置为向上
2. WHEN 玩家按下下方向键, THE Game SHALL 将 Snake 的移动方向设置为向下
3. WHEN 玩家按下左方向键, THE Game SHALL 将 Snake 的移动方向设置为向左
4. WHEN 玩家按下右方向键, THE Game SHALL 将 Snake 的移动方向设置为向右
5. WHEN 玩家按下与当前移动方向相反的方向键, THE Game SHALL 忽略该输入（例如蛇向右移动时不能直接向左转）
6. WHILE Game_Loop 运行中, THE Snake SHALL 沿当前 Direction 以每 150 毫秒一个网格单元的速度持续移动

### Requirement 3: 食物与得分

**User Story:** As a 玩家, I want 蛇吃到食物后得分增加并且蛇变长, so that 游戏具有挑战性和成就感。

#### Acceptance Criteria

1. WHEN Snake 的头部移动到 Food 所在的 Grid 位置, THE Game SHALL 将 Score 增加 10 分
2. WHEN Snake 吃到 Food, THE Snake SHALL 增加一个方块的长度
3. WHEN Food 被吃掉, THE Game SHALL 在 Grid 上一个未被 Snake 占据的随机位置生成新的 Food
4. WHEN Score 更新, THE Renderer SHALL 立即在界面上显示最新的 Score 值

### Requirement 4: 碰撞检测与游戏结束

**User Story:** As a 玩家, I want 游戏在蛇碰到边界或自身时结束, so that 游戏有明确的失败条件和挑战性。

#### Acceptance Criteria

1. WHEN Snake 的头部移动超出 Canvas 边界, THE Game SHALL 立即结束游戏
2. WHEN Snake 的头部移动到 Snake 身体任意部分所在的 Grid 位置, THE Game SHALL 立即结束游戏
3. WHEN 游戏结束, THE Renderer SHALL 在画布上显示"游戏结束"提示和最终 Score
4. WHEN 游戏结束, THE Game SHALL 停止 Game_Loop

### Requirement 5: 重新开始游戏

**User Story:** As a 玩家, I want 游戏结束后可以重新开始, so that 我可以再次挑战更高分数。

#### Acceptance Criteria

1. WHEN 游戏结束, THE Game SHALL 显示"按空格键重新开始"的提示
2. WHEN 玩家在游戏结束状态下按下空格键, THE Game SHALL 重置 Snake 到初始位置和长度、Score 归零、生成新的 Food，并回到等待开始状态

### Requirement 6: 游戏渲染

**User Story:** As a 玩家, I want 游戏画面清晰流畅, so that 我有良好的游戏体验。

#### Acceptance Criteria

1. THE Renderer SHALL 使用不同颜色区分 Snake 的头部、身体和 Food
2. THE Renderer SHALL 在每个 Game_Loop 周期清除画布并重新绘制所有游戏元素
3. THE Renderer SHALL 绘制 Grid 的边界线以提供视觉参考
4. WHILE Game_Loop 运行中, THE Renderer SHALL 保持稳定的帧率，无明显卡顿

### Requirement 7: 页面布局与样式

**User Story:** As a 玩家, I want 游戏页面美观且居中显示, so that 我有舒适的视觉体验。

#### Acceptance Criteria

1. THE Game SHALL 将 Canvas 水平居中显示在页面中
2. THE Game SHALL 在 Canvas 上方显示游戏标题"贪吃蛇"
3. THE Game SHALL 使用深色背景以突出游戏画布
4. THE Game SHALL 在页面底部显示操作说明（方向键控制、空格键重新开始）
