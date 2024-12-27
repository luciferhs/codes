const Board = require('./js/board')
const GameUI = require('./js/gameUI')
const AI = require('./js/ai')
const adapter = require('./js/libs/weapp-adapter')

class Game {
    constructor() {
        // 获取屏幕尺寸
        const { windowWidth: width, windowHeight: height } = wx.getSystemInfoSync()
        this.width = width
        this.height = height
        
        // 计算棋盘参数
        this.gridSize = Math.min(width, height) / 16
        this.startX = (width - 14 * this.gridSize) / 2
        this.startY = (height - 14 * this.gridSize) / 2
        
        // 初始化游戏组件
        this.board = new Board(adapter.context, width, height)
        this.gameUI = new GameUI(adapter.context, width, height, this.gridSize, this.startX, this.startY)
        this.ai = new AI()
        
        // 游戏状态
        this.gameOver = false
        this.winner = null
        this.difficulty = 'normal'
        this.wins = 0
        this.losses = 0
        this.draws = 0
        
        // 注册触摸事件
        this.registerTouchHandler()
        
        // 开始游戏循环
        this.gameLoop()
    }

    restart() {
        this.board.reset()
        this.gameOver = false
        this.winner = null
    }

    handleMove(x, y) {
        if (this.gameOver) return
        
        // 计算棋盘位置
        const boardX = Math.round((x - this.startX) / this.gridSize)
        const boardY = Math.round((y - this.startY) / this.gridSize)
        
        // 玩家回合
        if (this.board.makeMove({x: boardX, y: boardY}, 1)) {
            // 检查玩家是否获胜
            if (this.board.checkWin({x: boardX, y: boardY}, 1)) {
                this.gameOver = true
                this.winner = 'player'
                this.wins++
                return
            }
            
            // 检查是否平局
            if (this.board.isFull()) {
                this.gameOver = true
                this.winner = 'draw'
                this.draws++
                return
            }
            
            // AI回合
            const aiMove = this.ai.getMove(this.board)
            if (aiMove && this.board.makeMove(aiMove, 2)) {
                // 检查AI是否获胜
                if (this.board.checkWin(aiMove, 2)) {
                    this.gameOver = true
                    this.winner = 'ai'
                    this.losses++
                    return
                }
                
                // 再次检查是否平局
                if (this.board.isFull()) {
                    this.gameOver = true
                    this.winner = 'draw'
                    this.draws++
                }
            }
        }
    }

    registerTouchHandler() {
        wx.onTouchStart(e => {
            const touch = e.touches[0]
            const x = touch.clientX
            const y = touch.clientY
            
            // 检查是否点击了按钮
            const buttonClicked = this.gameUI.checkButtonClick(x, y)
            if (buttonClicked) {
                switch(buttonClicked) {
                    case 'difficulty':
                        this.gameUI.difficultyMenu.visible = !this.gameUI.difficultyMenu.visible
                        break
                    case 'restart':
                        this.restart()
                        break
                    case 'share':
                        wx.shareAppMessage({
                            title: '来玩五子棋！',
                            imageUrl: 'images/share.png'
                        })
                        break
                }
                return
            }
            
            // 检查是否点击了难度菜单
            if (this.gameUI.difficultyMenu.visible) {
                const difficulty = this.gameUI.checkDifficultyMenuClick(x, y)
                if (difficulty) {
                    this.difficulty = difficulty
                    this.ai.difficulty = difficulty
                    this.gameUI.difficultyMenu.visible = false
                    this.restart()
                    return
                }
                this.gameUI.difficultyMenu.visible = false
                return
            }
            
            // 处理棋盘点击
            this.handleMove(x, y)
        })
    }

    gameLoop() {
        // 清空画布
        adapter.context.fillStyle = '#F0F0F0' // 浅灰色背景
        adapter.context.fillRect(0, 0, this.width, this.height)
        
        // 绘制游戏状态
        this.board.draw()
        this.gameUI.draw({
            wins: this.wins,
            losses: this.losses,
            draws: this.draws,
            difficulty: this.difficulty,
            winner: this.winner,
            board: this.board
        })
        
        // 继续游戏循环
        adapter.requestAnimationFrame(this.gameLoop.bind(this))
    }
}

// 初始化游戏
new Game()
