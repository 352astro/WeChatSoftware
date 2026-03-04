import request from '../../utils/request.js';

Page({
  data: {
    // 假设从上个页面传递过来的总金额
    totalAmount: 3800, // 为避免浮点数精度问题，建议使用分作为单位处理逻辑，展示时再转换为元
    totalAmountStr: '38.00', 
    remark: '',
    addressInfo: {}, // 存储收货地址信息
    isSubmitting: false // 防止重复提交
  },

  onLoad(options) {
    // 在实际开发中，这里应该解析 options 拿到商品列表和总价
    this.fetchDefaultAddress();
  },

  onShow() {
    // 如果用户从地址选择页面返回，我们可能需要在这里刷新选中的地址
    // 实际项目中可以通过全局状态或 eventChannel 传递选中的地址
  },

  // 获取默认地址信息 (暂用模拟数据，假设接口存在)
  fetchDefaultAddress() {
    // 模拟接口调用：GET /api/address/default
    // request({ url: '/api/address/default', method: 'GET' }).then(...)
    
    // 使用模拟数据
    const mockAddress = {
      id: 101,
      consignee: "李四",
      phone: "13800138000",
      detailAddress: "浙江省杭州市西湖区某某街道XX号",
      label: "家"
    };
    
    this.setData({
      addressInfo: mockAddress
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
      url: '/pages/address-select/address-select', // 假设的地址选择页面路径
      fail: (err) => {
         console.warn("地址选择页面未就绪", err);
         wx.showToast({ title: '选择地址功能开发中', icon: 'none' });
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