const { CONFIG, GameState, Direction, Game } = require('../game');

describe('Game 常量配置', () => {
  test('CONFIG 包含正确的画布和网格配置', () => {
    expect(CONFIG.CANVAS_SIZE).toBe(400);
    expect(CONFIG.GRID_SIZE).toBe(20);
    expect(CONFIG.GRID_COUNT).toBe(20);
    expect(CONFIG.TICK_INTERVAL).toBe(150);
    expect(CONFIG.INITIAL_LENGTH).toBe(3);
    expect(CONFIG.SCORE_PER_FOOD).toBe(10);
  });

  test('CONFIG.COLORS 包含所有必要颜色', () => {
    expect(CONFIG.COLORS).toHaveProperty('BACKGROUND');
    expect(CONFIG.COLORS).toHaveProperty('GRID_LINE');
    expect(CONFIG.COLORS).toHaveProperty('SNAKE_HEAD');
    expect(CONFIG.COLORS).toHaveProperty('SNAKE_BODY');
    expect(CONFIG.COLORS).toHaveProperty('FOOD');
    expect(CONFIG.COLORS).toHaveProperty('TEXT');
  });

  test('GameState 包含三个状态', () => {
    expect(GameState.WAITING).toBe('waiting');
    expect(GameState.PLAYING).toBe('playing');
    expect(GameState.GAME_OVER).toBe('game_over');
  });

  test('Direction 包含四个方向及正确的向量', () => {
    expect(Direction.UP).toEqual({ x: 0, y: -1 });
    expect(Direction.DOWN).toEqual({ x: 0, y: 1 });
    expect(Direction.LEFT).toEqual({ x: -1, y: 0 });
    expect(Direction.RIGHT).toEqual({ x: 1, y: 0 });
  });
});

// Mock canvas 和 renderer 用于测试
function createMockCanvas() {
  return {
    width: CONFIG.CANVAS_SIZE,
    height: CONFIG.CANVAS_SIZE,
    getContext: () => ({})
  };
}

function createMockRenderer() {
  return { render: jest.fn() };
}

describe('Game 类构造函数和 reset 方法', () => {
  let game;

  beforeEach(() => {
    game = new Game(createMockCanvas(), createMockRenderer());
  });

  test('构造函数正确初始化游戏', () => {
    expect(game.canvas).toBeDefined();
    expect(game.renderer).toBeDefined();
    expect(game.state).toBe(GameState.WAITING);
    expect(game.score).toBe(0);
    expect(game.snake).toHaveLength(CONFIG.INITIAL_LENGTH);
  });

  test('初始蛇位于画布中央，长度为 3', () => {
    const center = Math.floor(CONFIG.GRID_COUNT / 2);
    expect(game.snake).toEqual([
      { x: center, y: center },
      { x: center - 1, y: center },
      { x: center - 2, y: center }
    ]);
  });

  test('初始方向为 RIGHT', () => {
    expect(game.direction).toEqual(Direction.RIGHT);
    expect(game.nextDirection).toEqual(Direction.RIGHT);
  });

  test('初始分数为 0', () => {
    expect(game.score).toBe(0);
  });

  test('初始状态为 WAITING', () => {
    expect(game.state).toBe(GameState.WAITING);
  });

  test('初始食物已生成且在有效位置', () => {
    expect(game.food).not.toBeNull();
    expect(game.food.x).toBeGreaterThanOrEqual(0);
    expect(game.food.x).toBeLessThan(CONFIG.GRID_COUNT);
    expect(game.food.y).toBeGreaterThanOrEqual(0);
    expect(game.food.y).toBeLessThan(CONFIG.GRID_COUNT);
  });

  test('食物不与蛇身重叠', () => {
    const isOnSnake = game.snake.some(
      seg => seg.x === game.food.x && seg.y === game.food.y
    );
    expect(isOnSnake).toBe(false);
  });

  test('reset 方法恢复初始状态', () => {
    // 修改游戏状态
    game.score = 100;
    game.state = GameState.GAME_OVER;
    game.snake = [{ x: 0, y: 0 }];

    game.reset();

    expect(game.snake).toHaveLength(CONFIG.INITIAL_LENGTH);
    expect(game.score).toBe(0);
    expect(game.state).toBe(GameState.WAITING);
    expect(game.food).not.toBeNull();
    expect(game.direction).toEqual(Direction.RIGHT);
    expect(game.nextDirection).toEqual(Direction.RIGHT);
  });
});

describe('Game.changeDirection 方向控制', () => {
  let game;

  beforeEach(() => {
    game = new Game(createMockCanvas(), createMockRenderer());
  });

  test('有效方向变更更新 nextDirection', () => {
    // 初始方向为 RIGHT，向上转向应成功
    const result = game.changeDirection(Direction.UP);
    expect(result).toBe(true);
    expect(game.nextDirection).toEqual(Direction.UP);
  });

  test('可以向下转向（当前方向为 RIGHT）', () => {
    const result = game.changeDirection(Direction.DOWN);
    expect(result).toBe(true);
    expect(game.nextDirection).toEqual(Direction.DOWN);
  });

  test('反向输入被拒绝：RIGHT 时不能 LEFT', () => {
    // 初始方向为 RIGHT
    const result = game.changeDirection(Direction.LEFT);
    expect(result).toBe(false);
    expect(game.nextDirection).toEqual(Direction.RIGHT);
  });

  test('反向输入被拒绝：UP 时不能 DOWN', () => {
    game.direction = Direction.UP;
    game.nextDirection = Direction.UP;
    const result = game.changeDirection(Direction.DOWN);
    expect(result).toBe(false);
    expect(game.nextDirection).toEqual(Direction.UP);
  });

  test('反向输入被拒绝：DOWN 时不能 UP', () => {
    game.direction = Direction.DOWN;
    game.nextDirection = Direction.DOWN;
    const result = game.changeDirection(Direction.UP);
    expect(result).toBe(false);
    expect(game.nextDirection).toEqual(Direction.DOWN);
  });

  test('反向输入被拒绝：LEFT 时不能 RIGHT', () => {
    game.direction = Direction.LEFT;
    game.nextDirection = Direction.LEFT;
    const result = game.changeDirection(Direction.RIGHT);
    expect(result).toBe(false);
    expect(game.nextDirection).toEqual(Direction.LEFT);
  });

  test('同一 tick 多次转向只保留最后一次有效方向', () => {
    // 初始方向 RIGHT，先转 UP，再转 DOWN（DOWN 不是 RIGHT 的反向，所以有效）
    game.changeDirection(Direction.UP);
    expect(game.nextDirection).toEqual(Direction.UP);

    game.changeDirection(Direction.DOWN);
    expect(game.nextDirection).toEqual(Direction.DOWN);
  });

  test('反向校验基于 direction 而非 nextDirection', () => {
    // 初始方向 RIGHT，先转 UP（nextDirection 变为 UP）
    game.changeDirection(Direction.UP);
    expect(game.nextDirection).toEqual(Direction.UP);

    // 再转 LEFT：direction 仍为 RIGHT，LEFT 是 RIGHT 的反向，应被拒绝
    const result = game.changeDirection(Direction.LEFT);
    expect(result).toBe(false);
    expect(game.nextDirection).toEqual(Direction.UP);
  });
});

describe('Game.moveSnake 蛇移动逻辑', () => {
  let game;

  beforeEach(() => {
    game = new Game(createMockCanvas(), createMockRenderer());
  });

  test('蛇头沿当前方向移动一格（默认 RIGHT）', () => {
    const oldHead = { ...game.snake[0] };
    const newHead = game.moveSnake();
    expect(newHead).toEqual({ x: oldHead.x + 1, y: oldHead.y });
  });

  test('蛇头沿 UP 方向移动一格', () => {
    game.direction = Direction.UP;
    const oldHead = { ...game.snake[0] };
    const newHead = game.moveSnake();
    expect(newHead).toEqual({ x: oldHead.x, y: oldHead.y - 1 });
  });

  test('蛇头沿 DOWN 方向移动一格', () => {
    game.direction = Direction.DOWN;
    const oldHead = { ...game.snake[0] };
    const newHead = game.moveSnake();
    expect(newHead).toEqual({ x: oldHead.x, y: oldHead.y + 1 });
  });

  test('蛇头沿 LEFT 方向移动一格', () => {
    game.direction = Direction.LEFT;
    const oldHead = { ...game.snake[0] };
    const newHead = game.moveSnake();
    expect(newHead).toEqual({ x: oldHead.x - 1, y: oldHead.y });
  });

  test('旧蛇头变为第二节身体', () => {
    const oldHead = { ...game.snake[0] };
    game.moveSnake();
    expect(game.snake[1]).toEqual(oldHead);
  });

  test('移动后蛇长度不变（尾部被移除）', () => {
    const lengthBefore = game.snake.length;
    game.moveSnake();
    expect(game.snake.length).toBe(lengthBefore);
  });

  test('返回值为新蛇头坐标', () => {
    const newHead = game.moveSnake();
    expect(newHead).toEqual(game.snake[0]);
  });

  test('连续移动两次，蛇身正确跟随', () => {
    // 初始蛇: [(10,10), (9,10), (8,10)]，方向 RIGHT
    const center = Math.floor(CONFIG.GRID_COUNT / 2);
    game.moveSnake(); // 蛇: [(11,10), (10,10), (9,10)]
    game.moveSnake(); // 蛇: [(12,10), (11,10), (10,10)]
    expect(game.snake).toEqual([
      { x: center + 2, y: center },
      { x: center + 1, y: center },
      { x: center, y: center }
    ]);
  });
});

describe('Game.checkWallCollision 墙壁碰撞检测', () => {
  let game;

  beforeEach(() => {
    game = new Game(createMockCanvas(), createMockRenderer());
  });

  test('坐标在网格内不触发碰撞', () => {
    expect(game.checkWallCollision({ x: 5, y: 5 })).toBe(false);
    expect(game.checkWallCollision({ x: 10, y: 10 })).toBe(false);
  });

  test('边界位置 (0, 0) 是有效的', () => {
    expect(game.checkWallCollision({ x: 0, y: 0 })).toBe(false);
  });

  test('边界位置 (GRID_COUNT-1, GRID_COUNT-1) 是有效的', () => {
    expect(game.checkWallCollision({ x: CONFIG.GRID_COUNT - 1, y: CONFIG.GRID_COUNT - 1 })).toBe(false);
  });

  test('x < 0 触发碰撞', () => {
    expect(game.checkWallCollision({ x: -1, y: 5 })).toBe(true);
  });

  test('x >= GRID_COUNT 触发碰撞', () => {
    expect(game.checkWallCollision({ x: CONFIG.GRID_COUNT, y: 5 })).toBe(true);
  });

  test('y < 0 触发碰撞', () => {
    expect(game.checkWallCollision({ x: 5, y: -1 })).toBe(true);
  });

  test('y >= GRID_COUNT 触发碰撞', () => {
    expect(game.checkWallCollision({ x: 5, y: CONFIG.GRID_COUNT })).toBe(true);
  });
});

describe('Game.checkSelfCollision 自身碰撞检测', () => {
  let game;

  beforeEach(() => {
    game = new Game(createMockCanvas(), createMockRenderer());
  });

  test('头部与身体不重叠时不触发碰撞', () => {
    // 默认蛇身不会自碰撞
    const head = game.snake[0];
    expect(game.checkSelfCollision(head)).toBe(false);
  });

  test('头部与蛇身某节重叠时触发碰撞', () => {
    // 手动设置蛇身使头部与身体重叠
    game.snake = [
      { x: 5, y: 5 },
      { x: 6, y: 5 },
      { x: 7, y: 5 },
      { x: 5, y: 5 }  // 尾部与头部位置相同
    ];
    expect(game.checkSelfCollision(game.snake[0])).toBe(true);
  });

  test('头部位置与蛇身中间节重叠时触发碰撞', () => {
    game.snake = [
      { x: 6, y: 5 },
      { x: 6, y: 5 },  // 第二节与头部位置相同
      { x: 7, y: 5 },
    ];
    expect(game.checkSelfCollision(game.snake[0])).toBe(true);
  });

  test('传入任意坐标检测是否与蛇身重叠', () => {
    game.snake = [
      { x: 5, y: 5 },
      { x: 4, y: 5 },
      { x: 3, y: 5 },
    ];
    // 与第二节重叠
    expect(game.checkSelfCollision({ x: 4, y: 5 })).toBe(true);
    // 不与任何身体节重叠
    expect(game.checkSelfCollision({ x: 1, y: 1 })).toBe(false);
  });
});

describe('Game.checkFoodCollision 食物碰撞检测', () => {
  let game;

  beforeEach(() => {
    game = new Game(createMockCanvas(), createMockRenderer());
  });

  test('头部在食物位置时触发碰撞', () => {
    game.food = { x: 3, y: 7 };
    expect(game.checkFoodCollision({ x: 3, y: 7 })).toBe(true);
  });

  test('头部不在食物位置时不触发碰撞', () => {
    game.food = { x: 3, y: 7 };
    expect(game.checkFoodCollision({ x: 3, y: 8 })).toBe(false);
    expect(game.checkFoodCollision({ x: 4, y: 7 })).toBe(false);
    expect(game.checkFoodCollision({ x: 0, y: 0 })).toBe(false);
  });
});

describe('Game.spawnFood 食物生成逻辑', () => {
  let game;

  beforeEach(() => {
    game = new Game(createMockCanvas(), createMockRenderer());
  });

  test('生成的食物坐标在有效网格范围内', () => {
    const food = game.spawnFood();
    expect(food).not.toBeNull();
    expect(food.x).toBeGreaterThanOrEqual(0);
    expect(food.x).toBeLessThan(CONFIG.GRID_COUNT);
    expect(food.y).toBeGreaterThanOrEqual(0);
    expect(food.y).toBeLessThan(CONFIG.GRID_COUNT);
  });

  test('生成的食物不与蛇身重叠', () => {
    // 多次生成食物，每次都不应与蛇重叠
    for (let i = 0; i < 50; i++) {
      const food = game.spawnFood();
      const isOnSnake = game.snake.some(
        seg => seg.x === food.x && seg.y === food.y
      );
      expect(isOnSnake).toBe(false);
    }
  });

  test('蛇占据大部分网格时仍能正确生成食物', () => {
    // 构造一条几乎占满网格的蛇，只留一个空位
    game.snake = [];
    for (let x = 0; x < CONFIG.GRID_COUNT; x++) {
      for (let y = 0; y < CONFIG.GRID_COUNT; y++) {
        if (!(x === 0 && y === 0)) {
          game.snake.push({ x, y });
        }
      }
    }
    const food = game.spawnFood();
    expect(food).not.toBeNull();
    expect(food).toEqual({ x: 0, y: 0 });
  });

  test('蛇占满整个网格时返回 null', () => {
    // 构造占满整个网格的蛇
    game.snake = [];
    for (let x = 0; x < CONFIG.GRID_COUNT; x++) {
      for (let y = 0; y < CONFIG.GRID_COUNT; y++) {
        game.snake.push({ x, y });
      }
    }
    const food = game.spawnFood();
    expect(food).toBeNull();
  });

  test('不同蛇身配置下食物始终在未占据位置', () => {
    // 设置蛇占据第一行
    game.snake = [];
    for (let x = 0; x < CONFIG.GRID_COUNT; x++) {
      game.snake.push({ x, y: 0 });
    }
    const food = game.spawnFood();
    expect(food).not.toBeNull();
    // 食物不应在第一行
    expect(food.y).not.toBe(0);
  });
});

describe('食物碰撞得分与蛇增长逻辑', () => {
  let game;

  beforeEach(() => {
    game = new Game(createMockCanvas(), createMockRenderer());
  });

  test('蛇头移动到食物位置时 checkFoodCollision 返回 true', () => {
    // 将食物放在蛇头前方
    const head = game.snake[0];
    game.food = { x: head.x + 1, y: head.y };
    // 移动蛇（方向为 RIGHT）
    const newHead = game.moveSnake();
    expect(game.checkFoodCollision(newHead)).toBe(true);
  });

  test('吃到食物后分数增加 10', () => {
    const head = game.snake[0];
    game.food = { x: head.x + 1, y: head.y };
    const oldScore = game.score;

    const newHead = game.moveSnake();
    if (game.checkFoodCollision(newHead)) {
      game.score += CONFIG.SCORE_PER_FOOD;
    }

    expect(game.score).toBe(oldScore + CONFIG.SCORE_PER_FOOD);
  });

  test('吃到食物后蛇长度增加 1（通过恢复尾部）', () => {
    const head = game.snake[0];
    game.food = { x: head.x + 1, y: head.y };
    const oldLength = game.snake.length;

    // 保存尾部（moveSnake 会移除尾部）
    const tail = game.snake[game.snake.length - 1];
    const savedTail = { x: tail.x, y: tail.y };

    const newHead = game.moveSnake();
    if (game.checkFoodCollision(newHead)) {
      // 恢复尾部使蛇变长
      game.snake.push(savedTail);
    }

    expect(game.snake.length).toBe(oldLength + 1);
  });

  test('吃到食物后生成新食物', () => {
    const head = game.snake[0];
    game.food = { x: head.x + 1, y: head.y };
    const oldFood = { ...game.food };

    const newHead = game.moveSnake();
    if (game.checkFoodCollision(newHead)) {
      game.food = game.spawnFood();
    }

    // 新食物应该已生成（可能与旧食物位置不同，但一定在有效范围内）
    expect(game.food).not.toBeNull();
    expect(game.food.x).toBeGreaterThanOrEqual(0);
    expect(game.food.x).toBeLessThan(CONFIG.GRID_COUNT);
    expect(game.food.y).toBeGreaterThanOrEqual(0);
    expect(game.food.y).toBeLessThan(CONFIG.GRID_COUNT);
  });

  test('新生成的食物不与蛇身重叠', () => {
    const head = game.snake[0];
    game.food = { x: head.x + 1, y: head.y };

    const tail = game.snake[game.snake.length - 1];
    const savedTail = { x: tail.x, y: tail.y };

    const newHead = game.moveSnake();
    if (game.checkFoodCollision(newHead)) {
      game.snake.push(savedTail);
      game.food = game.spawnFood();
    }

    const isOnSnake = game.snake.some(
      seg => seg.x === game.food.x && seg.y === game.food.y
    );
    expect(isOnSnake).toBe(false);
  });

  test('未吃到食物时分数和蛇长度不变', () => {
    // 将食物放在远离蛇头的位置
    game.food = { x: 0, y: 0 };
    const oldScore = game.score;
    const oldLength = game.snake.length;

    const newHead = game.moveSnake();
    expect(game.checkFoodCollision(newHead)).toBe(false);
    // 不执行得分和增长逻辑
    expect(game.score).toBe(oldScore);
    expect(game.snake.length).toBe(oldLength);
  });

  test('连续吃两个食物后分数增加 20 且蛇长度增加 2', () => {
    const initialScore = game.score;
    const initialLength = game.snake.length;

    // 第一次吃食物
    let head = game.snake[0];
    game.food = { x: head.x + 1, y: head.y };
    let savedTail = { ...game.snake[game.snake.length - 1] };
    let newHead = game.moveSnake();
    if (game.checkFoodCollision(newHead)) {
      game.score += CONFIG.SCORE_PER_FOOD;
      game.snake.push(savedTail);
      game.food = game.spawnFood();
    }

    // 第二次吃食物
    head = game.snake[0];
    game.food = { x: head.x + 1, y: head.y };
    savedTail = { ...game.snake[game.snake.length - 1] };
    newHead = game.moveSnake();
    if (game.checkFoodCollision(newHead)) {
      game.score += CONFIG.SCORE_PER_FOOD;
      game.snake.push(savedTail);
      game.food = game.spawnFood();
    }

    expect(game.score).toBe(initialScore + 2 * CONFIG.SCORE_PER_FOOD);
    expect(game.snake.length).toBe(initialLength + 2);
  });
});

describe('Game.tick 游戏主循环', () => {
  let game, mockRenderer;

  beforeEach(() => {
    mockRenderer = createMockRenderer();
    game = new Game(createMockCanvas(), mockRenderer);
    game.state = GameState.PLAYING;
  });

  test('tick 将 nextDirection 应用到 direction', () => {
    game.changeDirection(Direction.UP);
    expect(game.direction).toEqual(Direction.RIGHT); // 尚未应用
    game.tick();
    expect(game.direction).toEqual(Direction.UP); // tick 后应用
  });

  test('tick 使蛇向前移动一格', () => {
    const oldHead = { ...game.snake[0] };
    game.tick();
    expect(game.snake[0]).toEqual({ x: oldHead.x + 1, y: oldHead.y });
  });

  test('tick 检测墙壁碰撞并设置 GAME_OVER', () => {
    // 将蛇放到右边界，方向向右
    game.snake = [
      { x: CONFIG.GRID_COUNT - 1, y: 5 },
      { x: CONFIG.GRID_COUNT - 2, y: 5 },
      { x: CONFIG.GRID_COUNT - 3, y: 5 }
    ];
    game.direction = Direction.RIGHT;
    game.nextDirection = Direction.RIGHT;

    game.tick();

    expect(game.state).toBe(GameState.GAME_OVER);
    expect(mockRenderer.render).toHaveBeenCalledWith(
      expect.objectContaining({ state: GameState.GAME_OVER })
    );
  });

  test('tick 检测自身碰撞并设置 GAME_OVER', () => {
    // 构造一条蛇：头部 (5,5) 向下移动到 (5,6)，与身体第 5 节重叠
    game.snake = [
      { x: 5, y: 5 },
      { x: 6, y: 5 },
      { x: 6, y: 6 },
      { x: 5, y: 6 },
      { x: 4, y: 6 },
      { x: 4, y: 5 },
      { x: 4, y: 4 }
    ];
    game.direction = Direction.DOWN;
    game.nextDirection = Direction.DOWN;
    // 蛇头 (5,5) 向下移动到 (5,6)，与第 3 节 (5,6) 重叠

    game.tick();

    expect(game.state).toBe(GameState.GAME_OVER);
  });

  test('tick 检测食物碰撞，增加分数并使蛇变长', () => {
    const head = game.snake[0];
    // 将食物放在蛇头前方
    game.food = { x: head.x + 1, y: head.y };
    const oldScore = game.score;
    const oldLength = game.snake.length;

    game.tick();

    expect(game.score).toBe(oldScore + CONFIG.SCORE_PER_FOOD);
    expect(game.snake.length).toBe(oldLength + 1);
  });

  test('tick 吃到食物后生成新食物', () => {
    const head = game.snake[0];
    game.food = { x: head.x + 1, y: head.y };

    game.tick();

    // 新食物应在有效范围内
    expect(game.food).not.toBeNull();
    expect(game.food.x).toBeGreaterThanOrEqual(0);
    expect(game.food.x).toBeLessThan(CONFIG.GRID_COUNT);
  });

  test('tick 每次调用都会触发渲染', () => {
    game.tick();
    expect(mockRenderer.render).toHaveBeenCalledTimes(1);
    expect(mockRenderer.render).toHaveBeenCalledWith(
      expect.objectContaining({
        state: GameState.PLAYING,
        snake: expect.any(Array),
        food: expect.any(Object),
        score: expect.any(Number)
      })
    );
  });

  test('未碰撞时蛇长度不变', () => {
    // 确保食物不在蛇头前方
    game.food = { x: 0, y: 0 };
    const oldLength = game.snake.length;

    game.tick();

    expect(game.snake.length).toBe(oldLength);
    expect(game.state).toBe(GameState.PLAYING);
  });
});

describe('Game.start 启动游戏', () => {
  let game;

  beforeEach(() => {
    jest.useFakeTimers();
    game = new Game(createMockCanvas(), createMockRenderer());
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('start 将状态设为 PLAYING', () => {
    expect(game.state).toBe(GameState.WAITING);
    game.start();
    expect(game.state).toBe(GameState.PLAYING);
  });

  test('start 创建 interval', () => {
    game.start();
    expect(game.intervalId).not.toBeNull();
  });

  test('start 后 interval 以 150ms 间隔调用 tick', () => {
    const tickSpy = jest.spyOn(game, 'tick');
    game.start();

    expect(tickSpy).not.toHaveBeenCalled();

    jest.advanceTimersByTime(150);
    expect(tickSpy).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(150);
    expect(tickSpy).toHaveBeenCalledTimes(2);

    game.stop();
    tickSpy.mockRestore();
  });
});

describe('Game.stop 停止游戏', () => {
  let game;

  beforeEach(() => {
    jest.useFakeTimers();
    game = new Game(createMockCanvas(), createMockRenderer());
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('stop 将状态设为 GAME_OVER', () => {
    game.start();
    game.stop();
    expect(game.state).toBe(GameState.GAME_OVER);
  });

  test('stop 清除 interval', () => {
    game.start();
    expect(game.intervalId).not.toBeNull();
    game.stop();
    expect(game.intervalId).toBeNull();
  });

  test('stop 后 tick 不再被调用', () => {
    const tickSpy = jest.spyOn(game, 'tick');
    game.start();
    game.stop();

    jest.advanceTimersByTime(300);
    expect(tickSpy).not.toHaveBeenCalled();

    tickSpy.mockRestore();
  });
});

describe('Game.handleKeydown 键盘事件处理', () => {
  let game, mockRenderer;

  function createKeyEvent(key) {
    return { key, preventDefault: jest.fn() };
  }

  beforeEach(() => {
    jest.useFakeTimers();
    mockRenderer = createMockRenderer();
    game = new Game(createMockCanvas(), mockRenderer);
  });

  afterEach(() => {
    if (game.intervalId) {
      game.stop();
    }
    jest.useRealTimers();
  });

  // PLAYING 状态下方向键映射正确
  test('PLAYING 状态下 ArrowUp 调用 changeDirection(UP)', () => {
    game.state = GameState.PLAYING;
    game.direction = Direction.RIGHT;
    game.nextDirection = Direction.RIGHT;

    game.handleKeydown(createKeyEvent('ArrowUp'));
    expect(game.nextDirection).toEqual(Direction.UP);
  });

  test('PLAYING 状态下 ArrowDown 调用 changeDirection(DOWN)', () => {
    game.state = GameState.PLAYING;
    game.direction = Direction.RIGHT;
    game.nextDirection = Direction.RIGHT;

    game.handleKeydown(createKeyEvent('ArrowDown'));
    expect(game.nextDirection).toEqual(Direction.DOWN);
  });

  test('PLAYING 状态下 ArrowLeft 调用 changeDirection(LEFT)', () => {
    game.state = GameState.PLAYING;
    game.direction = Direction.UP;
    game.nextDirection = Direction.UP;

    game.handleKeydown(createKeyEvent('ArrowLeft'));
    expect(game.nextDirection).toEqual(Direction.LEFT);
  });

  test('PLAYING 状态下 ArrowRight 调用 changeDirection(RIGHT)', () => {
    game.state = GameState.PLAYING;
    game.direction = Direction.UP;
    game.nextDirection = Direction.UP;

    game.handleKeydown(createKeyEvent('ArrowRight'));
    expect(game.nextDirection).toEqual(Direction.RIGHT);
  });

  // WAITING 状态下按方向键启动游戏
  test('WAITING 状态下按方向键启动游戏', () => {
    expect(game.state).toBe(GameState.WAITING);

    game.handleKeydown(createKeyEvent('ArrowUp'));

    expect(game.state).toBe(GameState.PLAYING);
    expect(game.nextDirection).toEqual(Direction.UP);
    expect(game.intervalId).not.toBeNull();
    expect(mockRenderer.render).toHaveBeenCalledWith(
      expect.objectContaining({ state: GameState.PLAYING })
    );
  });

  test('WAITING 状态下按反向键不启动游戏', () => {
    // 初始方向为 RIGHT，按 LEFT 是反向，应被忽略
    expect(game.state).toBe(GameState.WAITING);

    game.handleKeydown(createKeyEvent('ArrowLeft'));

    expect(game.state).toBe(GameState.WAITING);
    expect(game.intervalId).toBeNull();
  });

  // GAME_OVER 状态下按空格键重置游戏
  test('GAME_OVER 状态下按空格键重置游戏', () => {
    game.start();
    game.stop();
    expect(game.state).toBe(GameState.GAME_OVER);
    game.score = 50;

    game.handleKeydown(createKeyEvent(' '));

    expect(game.state).toBe(GameState.WAITING);
    expect(game.score).toBe(0);
    expect(game.snake).toHaveLength(CONFIG.INITIAL_LENGTH);
    expect(mockRenderer.render).toHaveBeenCalledWith(
      expect.objectContaining({ state: GameState.WAITING, score: 0 })
    );
  });

  // 忽略无关按键
  test('非方向键/空格键被忽略', () => {
    game.state = GameState.PLAYING;
    const event = createKeyEvent('a');

    game.handleKeydown(event);

    expect(event.preventDefault).not.toHaveBeenCalled();
  });

  test('WAITING/PLAYING 状态下空格键被忽略', () => {
    // WAITING 状态
    game.handleKeydown(createKeyEvent(' '));
    expect(game.state).toBe(GameState.WAITING);

    // PLAYING 状态
    game.start();
    const scoreBefore = game.score;
    game.handleKeydown(createKeyEvent(' '));
    expect(game.score).toBe(scoreBefore);
    expect(game.state).toBe(GameState.PLAYING);
  });

  test('GAME_OVER 状态下方向键被忽略', () => {
    game.start();
    game.stop();
    expect(game.state).toBe(GameState.GAME_OVER);

    game.handleKeydown(createKeyEvent('ArrowUp'));

    expect(game.state).toBe(GameState.GAME_OVER);
  });

  // 方向键阻止默认行为
  test('方向键调用 event.preventDefault 防止页面滚动', () => {
    game.state = GameState.PLAYING;
    const event = createKeyEvent('ArrowUp');

    game.handleKeydown(event);

    expect(event.preventDefault).toHaveBeenCalled();
  });
});
