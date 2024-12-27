class Board {
    constructor(ctx, width, height) {
        this.ctx = ctx
        this.width = width
        this.height = height
        this.gridSize = Math.min(width, height) / 16 // 格子大小
        this.boardSize = 15 // 15x15的棋盘
        this.winningLine = null // 存储获胜的五子位置
        
        // 计算棋盘的起始位置，使其居中
        this.startX = (width - (this.boardSize - 1) * this.gridSize) / 2
        this.startY = (height - (this.boardSize - 1) * this.gridSize) / 2
        
        // 初始化棋盘数组
        this.board = Array(this.boardSize).fill().map(() => Array(this.boardSize).fill(0))
    }

    reset() {
        this.board = Array(this.boardSize).fill().map(() => Array(this.boardSize).fill(0))
        this.winningLine = null
    }

    draw() {
        this.ctx.save()
        
        // 绘制棋盘背景
        this.ctx.fillStyle = '#FFCC99' // 浅木色背景
        this.ctx.fillRect(
            this.startX - this.gridSize,
            this.startY - this.gridSize,
            (this.boardSize + 1) * this.gridSize,
            (this.boardSize + 1) * this.gridSize
        )
        
        // 设置线条样式
        this.ctx.strokeStyle = '#000000'
        this.ctx.lineWidth = 1
        
        // 绘制棋盘网格
        for (let i = 0; i < this.boardSize; i++) {
            // 绘制水平线
            this.ctx.beginPath()
            this.ctx.moveTo(this.startX, this.startY + i * this.gridSize)
            this.ctx.lineTo(this.startX + (this.boardSize - 1) * this.gridSize, 
                           this.startY + i * this.gridSize)
            this.ctx.stroke()
            
            // 绘制垂直线
            this.ctx.beginPath()
            this.ctx.moveTo(this.startX + i * this.gridSize, this.startY)
            this.ctx.lineTo(this.startX + i * this.gridSize, 
                           this.startY + (this.boardSize - 1) * this.gridSize)
            this.ctx.stroke()
        }
        
        // 绘制棋子
        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize; j++) {
                if (this.board[i][j] !== 0) {
                    this.ctx.beginPath()
                    this.ctx.arc(
                        this.startX + i * this.gridSize,
                        this.startY + j * this.gridSize,
                        this.gridSize * 0.4,
                        0,
                        Math.PI * 2
                    )
                    
                    // 设置棋子颜色
                    if (this.board[i][j] === 1) {
                        this.ctx.fillStyle = '#000000' // 玩家的棋子是黑色
                    } else {
                        this.ctx.fillStyle = '#ffffff' // AI的棋子是白色
                        this.ctx.strokeStyle = '#000000'
                        this.ctx.lineWidth = 1
                        this.ctx.stroke()
                    }
                    
                    this.ctx.fill()
                }
            }
        }
        
        // 如果有获胜线，绘制它
        if (this.winningLine) {
            this.ctx.beginPath()
            this.ctx.strokeStyle = '#FF0000'
            this.ctx.lineWidth = 2
            this.ctx.moveTo(
                this.startX + this.winningLine[0].x * this.gridSize,
                this.startY + this.winningLine[0].y * this.gridSize
            )
            this.ctx.lineTo(
                this.startX + this.winningLine[4].x * this.gridSize,
                this.startY + this.winningLine[4].y * this.gridSize
            )
            this.ctx.stroke()
        }
        
        this.ctx.restore()
    }

    getTouchPosition(x, y) {
        // 将触摸坐标转换为棋盘坐标
        const boardX = Math.round((x - this.startX) / this.gridSize)
        const boardY = Math.round((y - this.startY) / this.gridSize)
        
        return { x: boardX, y: boardY }
    }

    isValidMove(pos) {
        return pos.x >= 0 && pos.x < this.boardSize &&
               pos.y >= 0 && pos.y < this.boardSize &&
               this.board[pos.x][pos.y] === 0
    }

    makeMove(pos, player) {
        if (this.isValidMove(pos)) {
            this.board[pos.x][pos.y] = player
            
            // 检查是否获胜
            if (this.checkWin(pos, player)) {
                return true
            }
            
            return true
        }
        return false
    }

    checkWin(pos, player) {
        const directions = [
            [[1, 0], [-1, 0]], // 水平
            [[0, 1], [0, -1]], // 垂直
            [[1, 1], [-1, -1]], // 对角线
            [[1, -1], [-1, 1]] // 反对角线
        ]
        
        for (const [dir1, dir2] of directions) {
            let count = 1
            const line = [{x: pos.x, y: pos.y}]
            
            // 向一个方向计数
            let x = pos.x + dir1[0]
            let y = pos.y + dir1[1]
            while (x >= 0 && x < this.boardSize && y >= 0 && y < this.boardSize && 
                   this.board[x][y] === player) {
                count++
                line.push({x, y})
                x += dir1[0]
                y += dir1[1]
            }
            
            // 向相反方向计数
            x = pos.x + dir2[0]
            y = pos.y + dir2[1]
            while (x >= 0 && x < this.boardSize && y >= 0 && y < this.boardSize && 
                   this.board[x][y] === player) {
                count++
                line.unshift({x, y})
                x += dir2[0]
                y += dir2[1]
            }
            
            if (count >= 5) {
                this.winningLine = line // 保存获胜的五子位置
                return true
            }
        }
        
        return false
    }

    getWinningLine() {
        return this.winningLine
    }

    isFull() {
        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize; j++) {
                if (this.board[i][j] === 0) return false
            }
        }
        return true
    }
}

module.exports = Board
