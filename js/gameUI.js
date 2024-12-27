class GameUI {
    constructor(ctx, width, height, gridSize, startX, startY) {
        this.ctx = ctx
        this.width = width
        this.height = height
        this.gridSize = gridSize
        this.startX = startX
        this.startY = startY
        
        // Define buttons
        this.buttons = {
            difficulty: {
                x: 20,
                y: 20,
                width: 100,
                height: 40,
                text: 'Difficulty'
            },
            share: {
                x: width - 120,
                y: 20,
                width: 100,
                height: 40,
                text: 'Share'
            },
            restart: {
                x: (width - 100) / 2,
                y: height - 60,
                width: 100,
                height: 40,
                text: 'Restart'
            }
        }
        
        // Define difficulty menu
        this.difficultyMenu = {
            visible: false,
            options: ['Easy', 'Normal', 'Hard'],
            x: 20,
            y: 70,
            width: 100,
            height: 120
        }
    }

    draw(gameData) {
        this.drawButtons()
        this.drawScore(gameData)
        this.drawDifficultyLabel(gameData.difficulty)
        if (this.difficultyMenu.visible) {
            this.drawDifficultyMenu()
        }
        
        // 绘制获胜线
        const winningLine = gameData.board.getWinningLine()
        if (winningLine) {
            this.drawWinningLine(winningLine)
            this.showGameResult(gameData.winner)
        }
    }

    drawButtons() {
        this.ctx.save()
        
        // Set button style
        this.ctx.fillStyle = '#4CAF50'
        this.ctx.strokeStyle = '#45a049'
        this.ctx.lineWidth = 2
        this.ctx.font = '16px Arial'
        this.ctx.textAlign = 'center'
        this.ctx.textBaseline = 'middle'
        
        // Draw all buttons
        for (const button of Object.values(this.buttons)) {
            // Button background
            this.ctx.fillStyle = '#4CAF50'
            this.roundRect(button.x, button.y, button.width, button.height, 5)
            this.ctx.fill()
            this.ctx.stroke()
            
            // Button text
            this.ctx.fillStyle = '#ffffff'
            this.ctx.fillText(
                button.text,
                button.x + button.width / 2,
                button.y + button.height / 2
            )
        }
        
        this.ctx.restore()
    }

    drawScore(gameData) {
        this.ctx.save()
        
        this.ctx.font = '16px Arial'
        this.ctx.fillStyle = '#000'
        this.ctx.textAlign = 'center'
        
        const scoreText = `W: ${gameData.wins} L: ${gameData.losses} D: ${gameData.draws}`
        this.ctx.fillText(scoreText, this.width / 2, 40)
        
        this.ctx.restore()
    }

    drawDifficultyLabel(difficulty) {
        this.ctx.save()
        
        // Draw current difficulty label
        this.ctx.font = '14px Arial'
        this.ctx.fillStyle = '#000'
        this.ctx.textAlign = 'left'
        
        // Set difficulty label color
        const colors = {
            easy: '#4CAF50',    // Green
            normal: '#FFA500',  // Orange
            hard: '#FF4444'     // Red
        }
        
        // Draw difficulty label background
        this.ctx.fillStyle = colors[difficulty.toLowerCase()]
        this.roundRect(130, 20, 70, 40, 5)
        this.ctx.fill()
        
        // Draw difficulty label text
        this.ctx.fillStyle = '#fff'
        this.ctx.textAlign = 'center'
        this.ctx.textBaseline = 'middle'
        this.ctx.fillText(
            difficulty.charAt(0).toUpperCase() + difficulty.slice(1),
            165,
            40
        )
        
        this.ctx.restore()
    }

    drawDifficultyMenu() {
        this.ctx.save()
        
        // Draw menu background
        this.ctx.fillStyle = '#ffffff'
        this.ctx.strokeStyle = '#000000'
        this.roundRect(
            this.difficultyMenu.x,
            this.difficultyMenu.y,
            this.difficultyMenu.width,
            this.difficultyMenu.height,
            5
        )
        this.ctx.fill()
        this.ctx.stroke()
        
        // Draw options
        this.ctx.font = '14px Arial'
        this.ctx.textAlign = 'center'
        
        const optionHeight = this.difficultyMenu.height / this.difficultyMenu.options.length
        this.difficultyMenu.options.forEach((option, index) => {
            // Set option color
            const colors = {
                'Easy': '#4CAF50',    // Green
                'Normal': '#FFA500',  // Orange
                'Hard': '#FF4444'     // Red
            }
            
            // Draw option background
            this.ctx.fillStyle = colors[option]
            this.roundRect(
                this.difficultyMenu.x,
                this.difficultyMenu.y + optionHeight * index,
                this.difficultyMenu.width,
                optionHeight,
                index === 0 ? 5 : 0,  // Only the first option has top rounded corner
                index === this.difficultyMenu.options.length - 1 ? 5 : 0  // Only the last option has bottom rounded corner
            )
            this.ctx.fill()
            
            // Draw option text
            this.ctx.fillStyle = '#ffffff'
            const y = this.difficultyMenu.y + optionHeight * (index + 0.5)
            this.ctx.fillText(option, this.difficultyMenu.x + this.difficultyMenu.width / 2, y)
        })
        
        this.ctx.restore()
    }

    drawWinningLine(winningLine) {
        this.ctx.save()
        
        // 设置线条样式
        this.ctx.strokeStyle = '#ff0000'
        this.ctx.lineWidth = 3
        
        // 开始绘制路径
        this.ctx.beginPath()
        const startPos = winningLine[0]
        this.ctx.moveTo(
            startPos.x * this.gridSize + this.startX,
            startPos.y * this.gridSize + this.startY
        )
        
        // 连接所有点
        for (let i = 1; i < winningLine.length; i++) {
            const pos = winningLine[i]
            this.ctx.lineTo(
                pos.x * this.gridSize + this.startX,
                pos.y * this.gridSize + this.startY
            )
        }
        
        // 绘制线条
        this.ctx.stroke()
        
        this.ctx.restore()
    }

    showGameResult(winner) {
        this.ctx.save()
        
        // 创建半透明背景
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
        this.ctx.fillRect(0, 0, this.width, this.height)
        
        // 创建结果框
        const boxWidth = 300
        const boxHeight = 150
        const boxX = (this.width - boxWidth) / 2
        const boxY = (this.height - boxHeight) / 2
        
        // 绘制结果框背景
        this.ctx.fillStyle = '#ffffff'
        this.roundRect(boxX, boxY, boxWidth, boxHeight, 10)
        this.ctx.fill()
        
        // 设置文本样式
        this.ctx.font = 'bold 24px Arial'
        this.ctx.textAlign = 'center'
        this.ctx.textBaseline = 'middle'
        
        // 显示结果文本
        let text, color
        switch(winner) {
            case 'player':
                text = '恭喜你赢了！'
                color = '#4CAF50'
                break
            case 'ai':
                text = '游戏结束'
                color = '#FF4444'
                break
            case 'draw':
                text = '平局'
                color = '#FFA500'
                break
        }
        
        this.ctx.fillStyle = color
        this.ctx.fillText(text, this.width / 2, this.height / 2 - 20)
        
        // 显示重新开始提示
        this.ctx.font = '16px Arial'
        this.ctx.fillStyle = '#666666'
        this.ctx.fillText('点击"Restart"重新开始', this.width / 2, this.height / 2 + 20)
        
        this.ctx.restore()
    }

    // Helper method: Draw rounded rectangle
    roundRect(x, y, width, height, radius, bottomRadius) {
        if (bottomRadius === undefined) bottomRadius = radius
        
        this.ctx.beginPath()
        this.ctx.moveTo(x + radius, y)
        this.ctx.lineTo(x + width - radius, y)
        this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
        this.ctx.lineTo(x + width, y + height - bottomRadius)
        this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
        this.ctx.lineTo(x + radius, y + height)
        this.ctx.quadraticCurveTo(x, y + height, x, y + height - bottomRadius)
        this.ctx.lineTo(x, y + radius)
        this.ctx.quadraticCurveTo(x, y, x + radius, y)
        this.ctx.closePath()
    }

    // Check if click is on a button
    checkButtonClick(x, y) {
        for (const [name, button] of Object.entries(this.buttons)) {
            if (x >= button.x && x <= button.x + button.width &&
                y >= button.y && y <= button.y + button.height) {
                return name
            }
        }
        return null
    }

    // Check if click is on a difficulty menu option
    checkDifficultyMenuClick(x, y) {
        if (!this.difficultyMenu.visible) return null
        
        if (x >= this.difficultyMenu.x &&
            x <= this.difficultyMenu.x + this.difficultyMenu.width &&
            y >= this.difficultyMenu.y &&
            y <= this.difficultyMenu.y + this.difficultyMenu.height) {
            
            const optionHeight = this.difficultyMenu.height / this.difficultyMenu.options.length
            const index = Math.floor((y - this.difficultyMenu.y) / optionHeight)
            
            if (index >= 0 && index < this.difficultyMenu.options.length) {
                return this.difficultyMenu.options[index].toLowerCase()
            }
        }
        return null
    }
}

module.exports = GameUI
