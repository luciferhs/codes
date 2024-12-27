class AI {
    constructor(difficulty = 'normal') {
        this.difficulty = difficulty
        this.directions = [
            [[1, 0], [-1, 0]], // 水平
            [[0, 1], [0, -1]], // 垂直
            [[1, 1], [-1, -1]], // 对角线
            [[1, -1], [-1, 1]] // 反对角线
        ]
        
        // 不同难度的搜索深度
        this.searchDepth = {
            easy: 0,
            normal: 1,
            hard: 2
        }
        
        // 缓存评估结果
        this.evaluationCache = new Map()
    }

    getMove(board) {
        // 清除缓存
        this.evaluationCache.clear()
        
        switch(this.difficulty) {
            case 'easy':
                return this.getRandomMove(board)
            case 'hard':
                return this.getBestMove(board)
            default:
                return this.getNormalMove(board)
        }
    }

    getRandomMove(board) {
        // 获取所有可能的移动
        const moves = this.getValidMoves(board)
        if (moves.length === 0) return null
        
        // 随机选择一个移动
        return moves[Math.floor(Math.random() * moves.length)]
    }

    getNormalMove(board) {
        // 获取所有可能的移动
        const moves = this.getValidMoves(board)
        if (moves.length === 0) return null
        
        // 评估每个移动
        let bestScore = -Infinity
        let bestMove = null
        
        for (const move of moves) {
            // 考虑进攻和防守
            const attackScore = this.evaluatePosition(board, move, 2) // AI的进攻得分
            const defendScore = this.evaluatePosition(board, move, 1) * 0.8 // 防守得分权重低一些
            const score = Math.max(attackScore, defendScore)
            
            if (score > bestScore) {
                bestScore = score
                bestMove = move
            }
        }
        
        return bestMove || moves[0]
    }

    getBestMove(board) {
        // 获取所有可能的移动
        const moves = this.getValidMoves(board)
        if (moves.length === 0) return null
        
        // 对移动进行预评估和排序
        const scoredMoves = moves.map(move => ({
            move,
            score: this.evaluatePosition(board, move, 2)
        }))
        
        // 按分数降序排序
        scoredMoves.sort((a, b) => b.score - a.score)
        
        // 只考虑最佳的几个移动
        const candidateMoves = scoredMoves.slice(0, 5)
        
        let bestScore = -Infinity
        let bestMove = null
        
        for (const {move} of candidateMoves) {
            board.board[move.x][move.y] = 2
            const score = this.minimax(
                board,
                this.searchDepth[this.difficulty],
                false,
                -Infinity,
                Infinity
            )
            board.board[move.x][move.y] = 0
            
            if (score > bestScore) {
                bestScore = score
                bestMove = move
            }
        }
        
        return bestMove || moves[0]
    }

    minimax(board, depth, isMaximizing, alpha, beta) {
        // 检查缓存
        const key = this.getBoardKey(board) + depth + isMaximizing
        if (this.evaluationCache.has(key)) {
            return this.evaluationCache.get(key)
        }
        
        // 检查终止条件
        if (this.checkWin(board, 2)) return 10000
        if (this.checkWin(board, 1)) return -10000
        if (depth === 0) return this.evaluateBoard(board)
        
        // 获取有效移动
        const moves = this.getValidMoves(board)
        if (moves.length === 0) return 0
        
        // 预评估移动
        const scoredMoves = moves.map(move => ({
            move,
            score: this.evaluatePosition(board, move, isMaximizing ? 2 : 1)
        }))
        
        // 排序并限制搜索范围
        scoredMoves.sort((a, b) => isMaximizing ? b.score - a.score : a.score - b.score)
        const limitedMoves = scoredMoves.slice(0, 4)
        
        let bestScore = isMaximizing ? -Infinity : Infinity
        
        for (const {move} of limitedMoves) {
            board.board[move.x][move.y] = isMaximizing ? 2 : 1
            const score = this.minimax(board, depth - 1, !isMaximizing, alpha, beta)
            board.board[move.x][move.y] = 0
            
            if (isMaximizing) {
                bestScore = Math.max(bestScore, score)
                alpha = Math.max(alpha, score)
            } else {
                bestScore = Math.min(bestScore, score)
                beta = Math.min(beta, score)
            }
            
            if (beta <= alpha) break
        }
        
        // 缓存结果
        this.evaluationCache.set(key, bestScore)
        return bestScore
    }

    getValidMoves(board) {
        const moves = []
        const centerX = Math.floor(board.boardSize / 2)
        const centerY = Math.floor(board.boardSize / 2)
        
        // 如果棋盘是空的，直接返回中心点
        if (this.isBoardEmpty(board)) {
            return [{x: centerX, y: centerY}]
        }
        
        // 遍历棋盘，只考虑已有棋子周围的空位
        for (let i = 0; i < board.boardSize; i++) {
            for (let j = 0; j < board.boardSize; j++) {
                if (board.board[i][j] === 0 && this.hasNeighbor(board, i, j)) {
                    moves.push({x: i, y: j})
                }
            }
        }
        
        return moves
    }

    isBoardEmpty(board) {
        for (let i = 0; i < board.boardSize; i++) {
            for (let j = 0; j < board.boardSize; j++) {
                if (board.board[i][j] !== 0) return false
            }
        }
        return true
    }

    hasNeighbor(board, x, y) {
        const range = 2 // 考虑2格范围内的邻居
        for (let i = Math.max(0, x - range); i <= Math.min(board.boardSize - 1, x + range); i++) {
            for (let j = Math.max(0, y - range); j <= Math.min(board.boardSize - 1, y + range); j++) {
                if (board.board[i][j] !== 0) return true
            }
        }
        return false
    }

    getBoardKey(board) {
        return board.board.map(row => row.join('')).join('')
    }

    checkWin(board, player) {
        const directions = [
            [1, 0], [0, 1], [1, 1], [1, -1]
        ]
        
        for (let i = 0; i < board.boardSize; i++) {
            for (let j = 0; j < board.boardSize; j++) {
                if (board.board[i][j] === player) {
                    for (const [dx, dy] of directions) {
                        let count = 1
                        // 正向检查
                        let x = i + dx
                        let y = j + dy
                        while (x >= 0 && x < board.boardSize && y >= 0 && y < board.boardSize && 
                               board.board[x][y] === player) {
                            count++
                            x += dx
                            y += dy
                        }
                        // 反向检查
                        x = i - dx
                        y = j - dy
                        while (x >= 0 && x < board.boardSize && y >= 0 && y < board.boardSize && 
                               board.board[x][y] === player) {
                            count++
                            x -= dx
                            y -= dy
                        }
                        if (count >= 5) return true
                    }
                }
            }
        }
        return false
    }

    evaluatePosition(board, pos, player) {
        // 检查缓存
        const key = this.getBoardKey(board) + pos.x + pos.y + player
        if (this.evaluationCache.has(key)) {
            return this.evaluationCache.get(key)
        }
        
        let score = 0
        
        // 检查每个方向
        for (const [dir1, dir2] of this.directions) {
            score += this.evaluateDirection(board, pos, dir1, dir2, player)
        }
        
        // 根据位置给予额外分数（中心位置更有价值）
        const centerX = board.boardSize / 2
        const centerY = board.boardSize / 2
        const distanceFromCenter = Math.sqrt(
            Math.pow(pos.x - centerX, 2) + 
            Math.pow(pos.y - centerY, 2)
        )
        score += (10 - distanceFromCenter) * 2
        
        // 缓存结果
        this.evaluationCache.set(key, score)
        return score
    }

    evaluateDirection(board, pos, dir1, dir2, player) {
        const patterns = {
            '11111': 100000, // 连五
            '011110': 10000, // 活四
            '011112': 1000,  // 冲四
            '211110': 1000,
            '01110': 1000,   // 活三
            '01112': 100,    // 冲三
            '21110': 100,
            '0110': 100,     // 活二
            '0112': 10,      // 冲二
            '2110': 10
        }
        
        let line = ''
        // 获取方向上的棋型
        for (let i = -4; i <= 4; i++) {
            const x = pos.x + i * dir1[0]
            const y = pos.y + i * dir1[1]
            
            if (x >= 0 && x < board.boardSize && y >= 0 && y < board.boardSize) {
                if (board.board[x][y] === player) {
                    line += '1'
                } else if (board.board[x][y] === 0) {
                    line += '0'
                } else {
                    line += '2'
                }
            } else {
                line += '2' // 把边界也视为对手的棋子
            }
        }
        
        let score = 0
        // 评估所有可能的棋型
        for (const [pattern, value] of Object.entries(patterns)) {
            if (line.includes(pattern)) {
                score += value
            }
        }
        
        return score
    }

    evaluateBoard(board) {
        // 检查缓存
        const key = this.getBoardKey(board)
        if (this.evaluationCache.has(key)) {
            return this.evaluationCache.get(key)
        }
        
        let score = 0
        
        // 评估所有位置
        for (let i = 0; i < board.boardSize; i++) {
            for (let j = 0; j < board.boardSize; j++) {
                if (board.board[i][j] !== 0) {
                    const posScore = this.evaluatePosition(board, {x: i, y: j}, board.board[i][j])
                    score += board.board[i][j] === 2 ? posScore : -posScore
                }
            }
        }
        
        // 缓存结果
        this.evaluationCache.set(key, score)
        return score
    }
}

module.exports = AI
