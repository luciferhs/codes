// weapp-adapter.js

// 创建画布
const canvas = wx.createCanvas()
const context = canvas.getContext('2d')

// 基础方法
const noop = () => {}

// 全局方法
const requestAnimationFrame = (cb) => setTimeout(cb, 1000 / 60)
const cancelAnimationFrame = (id) => clearTimeout(id)

module.exports = {
    canvas,
    context,
    requestAnimationFrame,
    cancelAnimationFrame,
    noop
}
