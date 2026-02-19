// pages/carve/carve.js
Page({
  data: {
    canvas: null,
    ctx: null,
    dpr: 1
  },

  onReady() {
    this.initCanvas();
  },

  initCanvas() {
    const query = wx.createSelectorQuery();
    query.select('#carveCanvas')
      .fields({ node: true, size: true })
      .exec((res) => {
        const canvas = res[0].node;
        const ctx = canvas.getContext('2d');

        // 处理高分屏模糊问题
        const dpr = wx.getSystemInfoSync().pixelRatio;
        canvas.width = res[0].width * dpr;
        canvas.height = res[0].height * dpr;
        ctx.scale(dpr, dpr);

        // 设置画笔样式
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = 5;      // 画笔粗细
        ctx.strokeStyle = '#333'; // 雕刻痕迹颜色

        this.setData({ canvas, ctx, dpr });
      });
  },

  // 触摸开始
  handleTouchStart(e) {
    const { x, y } = e.touches[0];
    this.data.ctx.beginPath();
    this.data.ctx.moveTo(x, y);
  },

  // 触摸移动（绘图）
  handleTouchMove(e) {
    const { x, y } = e.touches[0];
    const ctx = this.data.ctx;
    ctx.lineTo(x, y);
    ctx.stroke();
    
    // 如果后续要传给3D，这里可以添加一个标志位
    // this.needsUpdate3D = true;
  },

  // 清空画布
  clearCanvas() {
    const { canvas, ctx } = this.data;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
});