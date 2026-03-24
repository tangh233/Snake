// 渲染模块 - 负责将游戏状态绘制到 Canvas 上
class Renderer {
  constructor(canvas, gridSize, colors) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.gridSize = gridSize;
    this.colors = colors || {};
  }

  // 清除画布
  clear() {
    this.ctx.fillStyle = this.colors.BACKGROUND || '#1a1a2e';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  // 绘制网格边界线
  drawGrid() {
    const ctx = this.ctx;
    ctx.strokeStyle = this.colors.GRID_LINE || '#16213e';
    ctx.lineWidth = 0.5;
    // 垂直线
    for (let x = 0; x <= this.canvas.width; x += this.gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.canvas.height);
      ctx.stroke();
    }
    // 水平线
    for (let y = 0; y <= this.canvas.height; y += this.gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.canvas.width, y);
      ctx.stroke();
    }
  }

  // 绘制蛇（头部与身体使用不同颜色）
  drawSnake(snake) {
    const ctx = this.ctx;
    const gs = this.gridSize;
    for (let i = 0; i < snake.length; i++) {
      ctx.fillStyle = i === 0
        ? (this.colors.SNAKE_HEAD || '#e94560')
        : (this.colors.SNAKE_BODY || '#0f3460');
      // 1px 内缩，形成段间间隙
      ctx.fillRect(snake[i].x * gs + 1, snake[i].y * gs + 1, gs - 2, gs - 2);
    }
  }

  // 绘制食物
  drawFood(food) {
    if (!food) return;
    this.ctx.fillStyle = this.colors.FOOD || '#e94560';
    this.ctx.fillRect(
      food.x * this.gridSize + 1,
      food.y * this.gridSize + 1,
      this.gridSize - 2,
      this.gridSize - 2
    );
  }

  // 绘制分数
  drawScore(score) {
    const ctx = this.ctx;
    ctx.fillStyle = this.colors.TEXT || '#eee';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('分数: ' + score, 10, 20);
  }

  // 绘制提示文字（居中显示）
  drawMessage(text) {
    const ctx = this.ctx;
    ctx.fillStyle = this.colors.TEXT || '#eee';
    ctx.font = '20px sans-serif';
    ctx.textAlign = 'center';
    const lines = text.split('\n');
    const lineHeight = 28;
    const startY = this.canvas.height / 2 - ((lines.length - 1) * lineHeight) / 2;
    for (let i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i], this.canvas.width / 2, startY + i * lineHeight);
    }
  }

  // 完整渲染一帧
  render(gameState) {
    this.clear();
    this.drawGrid();
    this.drawSnake(gameState.snake);
    this.drawFood(gameState.food);
    this.drawScore(gameState.score);

    if (gameState.state === 'waiting') {
      this.drawMessage('按方向键开始游戏');
    } else if (gameState.state === 'game_over') {
      this.drawMessage('游戏结束\n按空格键重新开始');
    }
  }
}

// 支持 Node.js（Jest 测试）和浏览器环境
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Renderer };
}
