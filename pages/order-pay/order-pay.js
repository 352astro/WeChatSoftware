import request from '../../utils/request.js';

Page({
  data: {
    orderNo: '',
    orderAmount: '0.00'
  },

  onLoad(options) {
    if (options.orderNo) {
      this.setData({ orderNo: options.orderNo });
      // 实际开发中，这里可以再调一次订单详情接口获取最新金额
    }
  },

  // 核心支付逻辑
  requestPayment() {
    const { orderNo } = this.data;

    wx.showLoading({ title: '准备支付...', mask: true });

    // 1. 调用后端接口获取支付参数
    request({
      url: '/api/order/payment',
      method: 'PUT',
      data: { orderNo }
    })
      .then(res => {
        wx.hideLoading();
        // 获取后端返回的微信支付 5 要素
        const payParams = res.data;

        // 2. 调用微信原生支付 API
        wx.requestPayment({
          timeStamp: payParams.timeStamp,
          nonceStr: payParams.nonceStr,
          package: payParams.packageStr, // 注意文档中对应 key 为 packageStr
          signType: payParams.signType,
          paySign: paySign.paySign,
          success: (res) => {
            wx.showToast({ title: '支付成功', icon: 'success' });
            // 跳转到支付成功结果页或订单中心
            setTimeout(() => {
              wx.reLaunch({ url: '/pages/profile/profile' });
            }, 1500);
          },
          fail: (err) => {
            console.error('用户取消支付或支付失败', err);
            wx.showToast({ title: '支付未完成', icon: 'none' });
          }
        });
      })
      .catch(err => {
        wx.hideLoading();
        // 调试环境模拟逻辑
        console.warn('支付接口未接通，模拟支付成功跳转');
        wx.showModal({
          title: '模拟支付',
          content: '是否模拟支付成功？',
          success: (res) => {
            if (res.confirm) {
              wx.reLaunch({ url: '/pages/profile/profile' });
            }
          }
        });
      });
  }
});