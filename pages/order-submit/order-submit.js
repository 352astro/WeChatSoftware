import request from '../../utils/request.js';

Page({
  data: {
    productList: [], // 新增：用来接收真实的商品列表
    totalAmount: 0,  // 用于传给后端的总金额（分或元，取决于后端要求）
    totalAmountStr: '0.00', // 用于前端展示的总金额字符串
    remark: '',
    addressInfo: {},
    isSubmitting: false,
    statusBarHeight: 20 // 兼容你刚刚加的自定义导航栏
  },

  onLoad(options) {
    // 1. 动态获取状态栏高度（如果已经加了自定义顶栏的话）
    const systemInfo = wx.getSystemInfoSync();
    this.setData({ statusBarHeight: systemInfo.statusBarHeight });

    // 2. ⚡️ 核心提取逻辑：从缓存中读取购物车传过来的真实数据
    const selectedProducts = wx.getStorageSync('selected_products') || [];
    const totalAmountStr = wx.getStorageSync('total_amount') || '0.00';

    // 假设你的后端提交订单要求金额是“分”为单位（很多支付接口要求这样，如果不要求请自行调整）
    // 这里我们将 38.00 转换为 3800
    const totalAmount = Math.round(parseFloat(totalAmountStr) * 100);

    // 3. 将真实数据绑定到页面
    this.setData({
      productList: selectedProducts,
      totalAmountStr: totalAmountStr,
      totalAmount: totalAmount
    });

    // 4. 拉取默认收货地址
    this.fetchDefaultAddress();
  },

  onShow() {
    // 从地址页选择返回后，读取用户选中的地址
    const selected = wx.getStorageSync('selected_address');
    if (selected && selected.id) {
      this.setData({ addressInfo: selected });
      wx.removeStorageSync('selected_address');
    }
  },

  // 获取默认地址（调用真实接口）
  fetchDefaultAddress() {
    request({ url: '/api/address/default', method: 'GET' })
      .then(res => {
        if ((res.data.code === 0 || res.data.code === 200) && res.data.data) {
          this.setData({ addressInfo: res.data.data });
        }
      })
      .catch(err => {
        console.warn('获取默认地址失败:', err);
      });
  },

  // 监听备注输入
  onRemarkInput(e) {
    this.setData({
      remark: e.detail.value
    });
  },

  // 跳转到地址选择页面
  goToAddressSelect() {
    wx.navigateTo({
      url: '/pages/address/address?from=order-submit'
    });
  },

  goBack() {
    wx.navigateBack({
      delta: 1,
      fail: () => {
        // 兜底跳转回个人中心或主页
        wx.switchTab({ url: '/pages/cart/cart' });
      }
    });
  },

  // 核心逻辑：提交订单
    submitOrder() {
      const { addressInfo, remark, totalAmount } = this.data;

      if (!addressInfo.id) {
        wx.showToast({ title: '请选择地址', icon: 'none' });
        return;
      }

      wx.showLoading({ title: '下单中...', mask: true });

      // 对接接口：POST /api/order/submit
      request({
        url: '/api/order/submit',
        method: 'POST',
        data: {
          addressId: addressInfo.id, // 地址ID
          remark: remark || '',      // 备注
          amount: totalAmount * 100  // 总金额（建议转为分发送）
        }
      }).then(res => {
        wx.hideLoading();
        if (res.data.code === 0) {
          const { orderNo } = res.data.data; // 获取返回的订单号
          // 下单成功，跳转支付页
          wx.navigateTo({
            url: `/pages/order-pay/order-pay?orderNo=${orderNo}&amount=${totalAmount}`
          });
        }
      });
    },
});