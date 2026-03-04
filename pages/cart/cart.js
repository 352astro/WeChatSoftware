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
      
      console.log('后端返回的原始数据:', res.data);
      let products = [];

      if ((res.data.code === 0 || res.data.code === 200) && Array.isArray(res.data.data)) {
        // 格式 1: 标准 { code: 200, data: [...] }
        products = res.data.data;
      } else if ((res.data.code === 0 || res.data.code === 200) && res.data.data && Array.isArray(res.data.data.records)) {
        // 格式 2: 分页对象 
        products = res.data.data.records;
      } else if (Array.isArray(res.data)) {
        products = res.data;
      }

      // 如果成功提取到了数组，开始渲染
      if (products && products.length > 0) {
        const cartList = products.map(item => {
          return {
            ...item,
            // 兼容后端的蛇形命名 (image_url) 和驼峰命名 (imageUrl)
            imageUrl: item.imageUrl || item.image_url || '📦', 
            count: 0 // 初始化购买数量为 0
          };
        });
        
        this.setData({ cartList });
        this.calculateTotal(); 
      } else {
        console.warn('商品列表为空，或者前端没能正确解析数据结构');
        // 如果解析失败，依然加载假数据兜底，防止白屏
        this.setMockData();
      }
    })
    .catch(err => {
      wx.hideLoading();
      console.error('请求商品列表失败', err);
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