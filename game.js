// 游戏常量配置
const CONFIG = {
  CANVAS_SIZE: 400,       // 画布尺寸（像素）
  GRID_SIZE: 20,          // 网格单元尺寸（像素）
  GRID_COUNT: 20,         // 网格数量（400 / 20）
  TICK_INTERVAL: 150,     // 游戏循环间隔（毫秒）
  INITIAL_LENGTH: 3,      // 蛇的初始长度
  SCORE_PER_FOOD: 10,     // 每个食物的分数
  COLORS: {
    BACKGROUND: '#1a1a2e',    // 画布背景色
    GRID_LINE: '#16213e',     // 网格线颜色
    SNAKE_HEAD: '#e94560',    // 蛇头颜色
    SNAKE_BODY: '#0f3460',    // 蛇身颜色
    FOOD: '#e94560',          // 食物颜色
    TEXT: '#eee',             // 文字颜色
  }
};

// 游戏状态枚举
const GameState = {
  WAITING: 'waiting',
  PLAYING: 'playing',
  GAME_OVER: 'game_over'
};

// 方向枚举及向量映射
const Direction = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 }
};

// 游戏核心类
class Game {
  constructor(canvas, renderer) {
    this.canvas = canvas;
    this.renderer = renderer;
    this.snake = [];
    this.food = null;
    this.score = 0;
    this.state = GameState.WAITING;
    this.direction = Direction.RIGHT;
    this.nextDirection = Direction.RIGHT;
    this.intervalId = null;
    this.reset();
  }

  // 初始化/重置游戏状态
  reset() {
    const center = Math.floor(CONFIG.GRID_COUNT / 2);
    this.snake = [];
    for (let i = 0; i < CONFIG.INITIAL_LENGTH; i++) {
      this.snake.push({ x: center - i, y: center });
    }
    this.score = 0;
    this.state = GameState.WAITING;
    this.direction = Direction.RIGHT;
    this.nextDirection = Direction.RIGHT;
    this.food = this.spawnFood();
  }

  // 改变方向（含反向校验）
  changeDirection(newDirection) {
    // 检测 180 度反向：新方向与当前方向的向量之和为零
    if (newDirection.x + this.direction.x === 0 && newDirection.y + this.direction.y === 0) {
      return false;
    }
    this.nextDirection = newDirection;
    return true;
  }

  // 移动蛇：计算新头部，更新蛇身数组，返回新头部坐标
  moveSnake() {
    const head = this.snake[0];
    const newHead = { x: head.x + this.direction.x, y: head.y + this.direction.y };
    this.snake.unshift(newHead);
    this.snake.pop();
    return newHead;
  }


  // 检测墙壁碰撞：坐标超出 [0, GRID_COUNT-1] 范围返回 true
  checkWallCollision(head) {
    return head.x < 0 || head.x >= CONFIG.GRID_COUNT || head.y < 0 || head.y >= CONFIG.GRID_COUNT;
  }

  // 检测自身碰撞：头部与蛇身（不含头部）重叠返回 true
  checkSelfCollision(head) {
    return this.snake.some((segment, index) => index > 0 && segment.x === head.x && segment.y === head.y);
  }

  // 检测食物碰撞：头部与食物位置相同返回 true
  checkFoodCollision(head) {
    return head.x === this.food.x && head.y === this.food.y;
  }

  // 游戏主循环：每个 tick 执行一次
  tick() {
    // 1. 应用缓冲方向
    this.direction = this.nextDirection;

    // 2. 保存当前尾部（用于吃食物时恢复）
    const tail = { ...this.snake[this.snake.length - 1] };

    // 3. 移动蛇
    const head = this.moveSnake();

    // 4. 墙壁碰撞检测
    if (this.checkWallCollision(head)) {
      this.stop();
      this.renderer.render({ state: this.state, snake: this.snake, food: this.food, score: this.score });
      return;
    }

    // 5. 自身碰撞检测
    if (this.checkSelfCollision(head)) {
      this.stop();
      this.renderer.render({ state: this.state, snake: this.snake, food: this.food, score: this.score });
      return;
    }

    // 6. 食物碰撞检测
    if (this.checkFoodCollision(head)) {
      this.score += CONFIG.SCORE_PER_FOOD;
      this.snake.push(tail);
      this.food = this.spawnFood();
    }

    // 7. 渲染
    this.renderer.render({ state: this.state, snake: this.snake, food: this.food, score: this.score });
  }

  // 启动游戏循环
  start() {
    this.state = GameState.PLAYING;
    this.intervalId = setInterval(() => this.tick(), CONFIG.TICK_INTERVAL);
  }

  // 停止游戏循环
  stop() {
    clearInterval(this.intervalId);
    this.intervalId = null;
    this.state = GameState.GAME_OVER;
  }

  // 处理键盘事件
  handleKeydown(event) {
    const keyDirectionMap = {
      'ArrowUp': Direction.UP,
      'ArrowDown': Direction.DOWN,
      'ArrowLeft': Direction.LEFT,
      'ArrowRight': Direction.RIGHT
    };

    const direction = keyDirectionMap[event.key];

    if (direction) {
      // 方向键：阻止默认滚动行为
      event.preventDefault();

      if (this.state === GameState.WAITING) {
        if (this.changeDirection(direction)) {
          this.start();
          this.renderer.render({ state: this.state, snake: this.snake, food: this.food, score: this.score });
        }
      } else if (this.state === GameState.PLAYING) {
        this.changeDirection(direction);
      }
    } else if (event.key === ' ' || event.key === 'Space') {
      if (this.state === GameState.GAME_OVER) {
        this.reset();
        this.renderer.render({ state: this.state, snake: this.snake, food: this.food, score: this.score });
      }
    }
  }

  // 在未被蛇占据的随机位置生成食物
  spawnFood() {
    const occupied = new Set(this.snake.map(s => `${s.x},${s.y}`));
    const available = [];
    for (let x = 0; x < CONFIG.GRID_COUNT; x++) {
      for (let y = 0; y < CONFIG.GRID_COUNT; y++) {
        if (!occupied.has(`${x},${y}`)) {
          available.push({ x, y });
        }
      }
    }
    if (available.length === 0) {
      return null;
    }
    return available[Math.floor(Math.random() * available.length)];
  }
}

// 浏览器环境下初始化游戏
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const renderer = new Renderer(canvas, CONFIG.GRID_SIZE, CONFIG.COLORS);
    const game = new Game(canvas, renderer);

    // 绑定键盘事件
    document.addEventListener('keydown', (e) => game.handleKeydown(e));

    // 初始渲染
    renderer.render({
      state: game.state,
      snake: game.snake,
      food: game.food,
      score: game.score
    });
  });
}

// 支持 Node.js（Jest 测试）和浏览器环境
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CONFIG, GameState, Direction, Game };
}
