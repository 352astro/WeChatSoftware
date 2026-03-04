import request from '../../utils/request.js';

Page({
  data: {
    statusBarHeight: 20,
    id: null,           // 如果有id就是编辑，没有就是新增
    consignee: '',      // 收货人
    phone: '',          // 手机号
    detailAddress: '',  // 详细地址
    label: '',          // 标签 (家/公司/学校)
    isDefault: 0        // 0-非默认, 1-默认
  },

  onLoad(options) {
    const systemInfo = wx.getSystemInfoSync();
    this.setData({ statusBarHeight: systemInfo.statusBarHeight });

    // 如果从列表页传了 ID 过来，说明是【编辑模式】
    if (options.id) {
      this.setData({ id: options.id });
      this.fetchAddressDetail(options.id);
    }
  },

  goBack() {
    wx.navigateBack({ delta: 1 });
  },

  // === 接口 1: 获取地址详情 (GET /api/address/{id}) ===
  fetchAddressDetail(id) {
    wx.showLoading({ title: '加载中...', mask: true });
    request({
      url: `/api/address/${id}`, 
      method: 'GET'
    }).then(res => {
      wx.hideLoading();
      if (res.data.code === 0 || res.data.code === 200) {
        const data = res.data.data;
        this.setData({
          consignee: data.consignee || '',
          phone: data.phone || '',
          detailAddress: data.detailAddress || '',
          label: data.label || '',
          isDefault: data.isDefault || 0
        });
      }
    });
  },

  // 监听输入框双向绑定
  onInput(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({
      [field]: e.detail.value
    });
  },

  // 监听标签点击
  chooseTag(e) {
    const tag = e.currentTarget.dataset.tag;
    // 如果点击已经选中的标签，则取消选中
    this.setData({
      label: this.data.label === tag ? '' : tag
    });
  },

  // 监听默认开关
  onDefaultChange(e) {
    this.setData({
      isDefault: e.detail.value ? 1 : 0
    });
  },

  // === 接口 2 & 3: 保存地址 (POST /api/address 或 PUT /api/address) ===
  saveAddress() {
    const { id, consignee, phone, detailAddress, label, isDefault } = this.data;

    // 基础表单校验
    if (!consignee.trim()) return wx.showToast({ title: '请填写收货人', icon: 'none' });
    if (!phone.trim() || phone.length < 11) return wx.showToast({ title: '请填写正确的手机号', icon: 'none' });
    if (!detailAddress.trim()) return wx.showToast({ title: '请填写详细地址', icon: 'none' });

    wx.showLoading({ title: '保存中...', mask: true });

    // 组装传给后端的 Payload
    const payload = { consignee, phone, detailAddress, label, isDefault };
    
    // 如果存在 ID，说明是修改，要把 ID 塞进 payload；如果是新增则不需要
    if (id) {
      payload.id = id; 
    }

    request({
      url: '/api/address',
      method: id ? 'PUT' : 'POST', // 智能判断请求方法
      data: payload
    }).then(res => {
      wx.hideLoading();
      if (res.data.code === 0 || res.data.code === 200) {
        wx.showToast({ title: '保存成功', icon: 'success' });
        // 保存成功后，延迟 1 秒返回列表页
        setTimeout(() => {
          wx.navigateBack({ delta: 1 });
        }, 1000);
      } else {
        wx.showToast({ title: res.data.message || '保存失败', icon: 'none' });
      }
    });
  }
});