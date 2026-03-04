import request from '../../utils/request.js';

Page({
  data: {
    orderNo: '',
    orderAmount: '0.01',
    statusBarHeight: 20
  },

  onLoad(options) {
    const systemInfo = wx.getSystemInfoSync();
    this.setData({
      statusBarHeight: systemInfo.statusBarHeight
    });
    if (options.orderNo) {
      this.setData({ orderNo: options.orderNo });
      // 实际开发中，这里可以再调一次订单详情接口获取最新金额
    }
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

  // 核心支付逻辑
    requestPayment() {
      const { orderNo } = this.data;

      request({
        url: '/api/order/payment',
        method: 'PUT',
        data: { orderNumber: orderNo } // 传入订单号
      }).then(res => {
        const payData = res.data.data; // 包含 nonceStr, paySign, timeStamp, signType, packageStr

        // 调用微信原生支付
        wx.requestPayment({
          timeStamp: payData.timeStamp,
          nonceStr: payData.nonceStr,
          package: payData.packageStr, // 注意 packageStr 对应
          signType: payData.signType,
          paySign: payData.paySign,
          success: () => {
            wx.showToast({ title: '支付成功', icon: 'success' });
            setTimeout(() => wx.reLaunch({ url: '/pages/profile/profile' }), 1500);
          },
          fail: (e) => {
            console.error('requestPayment fail:', e);
          }
        });
      });
    }
});