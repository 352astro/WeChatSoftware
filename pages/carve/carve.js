// pages/carve/carve.js
import upload from '../../utils/upload';

const BG_COLOR = '#85A96F';
const TOOL_COLOR_MAP = {
  carve: '#EFE8D4',
  hollow: '#FFFFFF',
  eraser: BG_COLOR
};
// 花纹默认绘制尺寸（逻辑像素）
const PATTERN_SIZE = 120;

Page({
  data: {
    statusBarHeight: 20,
    safeBottom: 0,
    canvasWidth: 320,
    canvasHeight: 420,
    lineWidth: 10,
    activeTool: 'carve',
    pendingPatternName: ''   // 待放置的花纹名称，非空时表示有花纹可用
  },

  onLoad() {
    const { statusBarHeight, safeArea, windowWidth, windowHeight } = wx.getSystemInfoSync();
    const topBarHeightPx = 44;
    const tabBarHeightPx = 50;            // 系统 tabBar 高度
    const bottomBarHeightPx = 130 + tabBarHeightPx;
    const horizontalPadding = 24;
    const verticalPadding = 24;
    const safeBottom = safeArea ? windowHeight - safeArea.bottom : 0;

    const usableWidth = windowWidth - horizontalPadding * 2;
    const usableHeight =
      windowHeight - statusBarHeight - topBarHeightPx - bottomBarHeightPx - safeBottom - verticalPadding * 2;

    this.setData({
      statusBarHeight,
      safeBottom,
      canvasWidth: Math.max(200, usableWidth),
      canvasHeight: Math.max(240, usableHeight)
    });
  },

  onReady() {
    this.initCanvas();
  },

  onShow() {
    // 从花纹库返回后，检查是否选择了花纹
    const pattern = wx.getStorageSync('selected_pattern');
    if (pattern && pattern.thumb) {
      wx.removeStorageSync('selected_pattern');
      // 暂存花纹，等待用户点击画布放置（仅一次）
      this.pendingPattern = pattern;
      this.setData({
        activeTool: 'pattern',
        pendingPatternName: pattern.name
      });
      wx.showToast({ title: `已加载「${pattern.name}」\n点击画布放置`, icon: 'none', duration: 2000 });
    }
  },

  // 跳转花纹库
  goToPatternLibrary() {
    wx.navigateTo({ url: '/pages/pattern-library/pattern-library' });
  },

  async initCanvas() {
    const query = wx.createSelectorQuery();
    query.select('#carveCanvas').fields({ node: true, size: true, rect: true });

    query.exec((res) => {
      const target = res && res[0];
      if (!target || !target.node) {
        wx.showToast({ title: '画布初始化失败', icon: 'none' });
        return;
      }

      const dpr = wx.getSystemInfoSync().pixelRatio || 1;
      const { node, width, height, left, top } = target;

      this.canvas = node;
      this.ctx = node.getContext('2d');
      this.canvasRect = { left: left || 0, top: top || 0 };
      this.dpr = dpr;

      this.canvas.width = width * dpr;
      this.canvas.height = height * dpr;
      this.ctx.scale(dpr, dpr);
      this.ctx.lineCap = 'round';
      this.ctx.lineJoin = 'round';

      this.drawBackground();
    });
  },

  // 绘制初始果皮底色和斑点纹理
  drawBackground() {
    if (!this.ctx) return;

    const { canvasWidth, canvasHeight } = this.data;
    this.ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    this.ctx.fillStyle = BG_COLOR;
    this.ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    const count = Math.floor((canvasWidth * canvasHeight) / 2600);
    for (let i = 0; i < count; i += 1) {
      const x = Math.random() * canvasWidth;
      const y = Math.random() * canvasHeight;
      const radius = 1 + Math.random() * 2.4;
      const alpha = 0.06 + Math.random() * 0.08;
      this.ctx.beginPath();
      this.ctx.arc(x, y, radius, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(28, 84, 73, ${alpha})`;
      this.ctx.fill();
    }
  },

  switchTool(e) {
    const tool = e.currentTarget.dataset.tool;
    // 普通工具切换（切换后取消待用花纹）
    if (TOOL_COLOR_MAP[tool]) {
      this.pendingPattern = null;
      this.setData({ activeTool: tool, pendingPatternName: '' });
    }
  },

  onSizeChange(e) {
    this.setData({ lineWidth: e.detail.value });
  },

  onSizeChanging(e) {
    this.setData({ lineWidth: e.detail.value });
  },

  onTouchStart(e) {
    const point = this.getTouchPoint(e);
    if (!point || !this.ctx) return;

    // 花纹工具：点击画布放置花纹图片（仅一次）
    if (this.data.activeTool === 'pattern') {
      if (!this.pendingPattern || !this.pendingPattern.thumb) return;
      this.drawPatternOnCanvas(this.pendingPattern.thumb, point.x, point.y);
      // 用完清除，恢复雕刻工具
      this.pendingPattern = null;
      this.setData({ activeTool: 'carve', pendingPatternName: '' });
      return;
    }

    this.isDrawing = true;
    this.lastPoint = point;

    this.ctx.beginPath();
    this.ctx.fillStyle = TOOL_COLOR_MAP[this.data.activeTool];
    this.ctx.arc(point.x, point.y, this.data.lineWidth / 2, 0, Math.PI * 2);
    this.ctx.fill();
  },

  onTouchMove(e) {
    if (!this.isDrawing || !this.ctx) return;
    const point = this.getTouchPoint(e);
    if (!point || !this.lastPoint) return;

    this.ctx.beginPath();
    this.ctx.strokeStyle = TOOL_COLOR_MAP[this.data.activeTool];
    this.ctx.lineWidth = this.data.lineWidth;
    this.ctx.moveTo(this.lastPoint.x, this.lastPoint.y);
    this.ctx.lineTo(point.x, point.y);
    this.ctx.stroke();

    this.lastPoint = point;
  },

  onTouchEnd() {
    this.isDrawing = false;
    this.lastPoint = null;
  },

  // 将花纹图片绘制到画布，以点击点为中心
  drawPatternOnCanvas(thumbPath, cx, cy) {
    if (!this.canvas || !this.ctx) return;

    const img = this.canvas.createImage();
    img.onload = () => {
      const half = PATTERN_SIZE / 2;
      this.ctx.drawImage(img, cx - half, cy - half, PATTERN_SIZE, PATTERN_SIZE);
    };
    img.onerror = () => {
      wx.showToast({ title: '花纹图片加载失败', icon: 'none' });
    };
    img.src = thumbPath;
  },

  getTouchPoint(e) {
    const touch = (e.touches && e.touches[0]) || (e.changedTouches && e.changedTouches[0]);
    if (!touch) return null;

    if (typeof touch.x === 'number' && typeof touch.y === 'number') {
      return { x: touch.x, y: touch.y };
    }

    return {
      x: touch.clientX - this.canvasRect.left,
      y: touch.clientY - this.canvasRect.top
    };
  },

  clearCanvas() {
    wx.showModal({
      title: '确认清空',
      content: '清空后不可恢复，是否继续？',
      success: ({ confirm }) => {
        if (!confirm) return;
        this.drawBackground();
      }
    });
  },

  saveArtwork() {
    if (!this.canvas) return;

    wx.showLoading({ title: '保存中...' });

    wx.canvasToTempFilePath({
      canvas: this.canvas,
      success: ({ tempFilePath }) => {
        upload({
          url: '/api/work/upload',
          filePath: tempFilePath,
          formData: {
            title: '我的作品'//TODO保存作品时要填入作品标题
          }
        }).then(res => {
          console.log("上传成功", res);
          wx.hideLoading();
          wx.showToast({ title: '上传成功', icon: 'success' });
        }).catch(err => {
          console.error("上传失败", err);
          wx.hideLoading();
          wx.showToast({ title: '上传失败', icon: 'none' });
        });
      },
      fail: () => {
        wx.hideLoading();
        wx.showToast({ title: '生成图片失败', icon: 'none' });
      }
    }, this);
  },

  saveToAlbum(tempFilePath) {
    wx.saveImageToPhotosAlbum({
      filePath: tempFilePath,
      success: () => {
        wx.hideLoading();
        wx.showToast({ title: '已保存到相册', icon: 'success' });
      },
      fail: (err) => {
        wx.hideLoading();
        const denied = err && err.errMsg && err.errMsg.includes('auth deny');
        if (denied) {
          wx.showModal({
            title: '需要相册权限',
            content: '请在设置中允许保存到相册',
            confirmText: '去设置',
            success: ({ confirm }) => {
              if (confirm) wx.openSetting();
            }
          });
          return;
        }
        wx.showToast({ title: '保存失败', icon: 'none' });
      }
    });
  },

  goBack() {
    wx.navigateBack();
  }
});