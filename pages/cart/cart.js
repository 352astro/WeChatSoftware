import request from '../../utils/request.js';

Page({
  data: {
    cartList: [], // 初始为空，等待接口返回
    totalAmount: '0.00'
  },

  onShow() {
    // 每次进入页面，拉取最新商品列表
    this.fetchProducts();
  },

  // 核心功能：从后端获取商品数据
  fetchProducts() {
    wx.showLoading({ title: '加载中...', mask: true });
    
    request({
      url: '/api/products',
      method: 'GET'
    })
    .then(res => {
      wx.hideLoading();
      if (res.data.code === 0 && res.data.data) {
        const products = res.data.data;
        
        // 为每个真实商品注入 count 属性，用于前端购物车逻辑
        const cartList = products.map(item => {
          return {
            ...item,
            count: 0 // 初始化购买数量为 0
          };
        });
        
        this.setData({ cartList });
        this.calculateTotal(); // 重置底部总价
      }
    })
    .catch(err => {
      wx.hideLoading();
      console.error('请求商品列表失败', err);
      // 开发调试阶段的 fallback (防止后端没开导致白屏)
      this.setMockData();
    });
  },

  // 计算总价逻辑
  calculateTotal() {
    const total = this.data.cartList.reduce((sum, item) => {
      return sum + (item.price * item.count);
    }, 0);
    this.setData({ totalAmount: total.toFixed(2) });
  },

  // 数量加减操作
  changeCount(e) {
    const { index, type } = e.currentTarget.dataset;
    let cartList = this.data.cartList;
    
    if (type === 'plus') {
      cartList[index].count++;
    } else if (type === 'minus' && cartList[index].count > 0) {
      cartList[index].count--;
    }
    
    this.setData({ cartList });
    this.calculateTotal();
  },

  // 前往确认订单页
  goToSubmitOrder() {
    if (parseFloat(this.data.totalAmount) <= 0) {
      wx.showToast({ title: '请先选择商品', icon: 'none' });
      return;
    }

    // 过滤出真正被选中的商品
    const selectedProducts = this.data.cartList.filter(item => item.count > 0);
    
    // 将选中的商品和总金额存入缓存，传递给 order-submit 页面
    wx.setStorageSync('selected_products', selectedProducts);
    wx.setStorageSync('total_amount', this.data.totalAmount);

    wx.navigateTo({
      url: '/pages/order-submit/order-submit'
    });
  },

  // --- 开发调试用：断网/后端没起时的容错数据 ---
  setMockData() {
    const mockList = [
      { id: 1, name: '青梅玉露·基础雕花原材', description: '肉厚核小，适合初学者', price: 38.00, count: 0, imageUrl: '🍑' },
      { id: 2, name: '金桔祥瑞·大师定制款', description: '纯手工雕刻', price: 128.00, count: 0, imageUrl: '🍊' }
    ];
    this.setData({ cartList: mockList });
    this.calculateTotal();
  }
});