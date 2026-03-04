import request from '../../utils/request.js';

Page({
  data: {
    addressList: [],
    statusBarHeight: 20,
    selectMode: false  // true 表示从订单页跳来选地址
  },

  onLoad(options) {
    // 动态获取状态栏高度，适配我们手写的自定义导航栏
    const systemInfo = wx.getSystemInfoSync();
    // 判断是否为选择模式（从 order-submit 页跳入）
    const selectMode = options.from === 'order-submit';
    this.setData({ statusBarHeight: systemInfo.statusBarHeight, selectMode });
  },

  onShow() {
    // 每次进入页面时，实时拉取最新地址列表
    this.fetchAddressList();
  },

  // 返回上一页
  goBack() {
    wx.navigateBack({
      delta: 1,
      fail: () => { wx.switchTab({ url: '/pages/profile/profile' }); }
    });
  },

  // 1. 获取当前用户的所有地址 (GET /api/address/list)
  fetchAddressList() {
    wx.showLoading({ title: '加载中...', mask: true });
    
    request({
      url: '/api/address/list',
      method: 'GET'
    })
    .then(res => {
      wx.hideLoading();
      // 防御性判断：兼容 Spring Boot 的 200 或自定义的 0
      if (res.data.code === 0 || res.data.code === 200) {
        let list = res.data.data || [];
        // 如果后端返回的是分页对象 (records)，则提取 records
        if (list.records && Array.isArray(list.records)) {
          list = list.records;
        }
        console.log('地址列表字段预览:', list[0]); // 打印第一条，核对字段名
        this.setData({ addressList: list });
      } else {
        wx.showToast({ title: res.data.message || '获取地址失败', icon: 'none' });
      }
    })
    .catch(err => {
      wx.hideLoading();
      console.error('获取地址列表失败:', err);
      // 容错：断网时不至于白屏，依然可以测试 UI
      wx.showToast({ title: '网络请求失败', icon: 'none' });
    });
  },

  // 2. 设置为默认地址 (PUT /api/address/default)
  setDefault(e) {
    const id = e.currentTarget.dataset.id;
    // 如果已经是默认地址，直接 return
    const currentItem = this.data.addressList.find(item => item.id === id);
    if (currentItem && (currentItem.isDefault === 1 || currentItem.isDefault === true)) return;

    wx.showLoading({ title: '设置中...', mask: true });
    request({
      url: `/api/address/default?id=${id}`,
      method: 'PUT'
    })
      .then(res => {
        wx.hideLoading();
        if (res.data.code === 0 || res.data.code === 200) {
          wx.showToast({ title: '已设为默认', icon: 'success' });
          // 重新拉取列表，避免依赖接口返回值格式不一致导致列表清空
          this.fetchAddressList();
        } else {
          wx.showToast({ title: res.data.message || '设置失败', icon: 'none' });
        }
      })
      .catch(() => {
        wx.hideLoading();
        wx.showToast({ title: '网络请求失败', icon: 'none' });
      });
  },

  // 3. 删除地址 (DELETE /api/address)
  deleteAddress(e) {
    const id = e.currentTarget.dataset.id;
    
    wx.showModal({
      title: '温馨提示',
      content: '确认要删除这个收货地址吗？',
      confirmColor: '#85A96F', // 保持我们的东方美学绿色
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '删除中...', mask: true });
          
          request({
            url: `/api/address?id=${id}`, 
            method: 'DELETE'
          })
          .then(delRes => {
            wx.hideLoading();
            if (delRes.data.code === 0 || delRes.data.code === 200) {
              wx.showToast({ title: '已删除', icon: 'success' });
              this.fetchAddressList(); // 删除成功后刷新列表
            } else {
              wx.showToast({ title: delRes.data.message || '删除失败', icon: 'none' });
            }
          });
        }
      }
    });
  },

  // 跳转到新增页面
  addAddress() {
    wx.navigateTo({ url: '/pages/address-edit/address-edit' });
  },

  // 跳转到编辑页面，把 ID 带过去
  editAddress(e) {
    const item = e.currentTarget.dataset.item;
    wx.navigateTo({ 
      url: `/pages/address-edit/address-edit?id=${item.id}`
    });
  },

  // 选择模式下：点击卡片将地址写入 Storage 并返回订单页
  selectAddress(e) {
    const item = e.currentTarget.dataset.item;
    wx.setStorageSync('selected_address', item);
    wx.navigateBack({ delta: 1 });
  },

  // 卡片点击统一入口：选择模式下触发选择，否则不响应
  onCardTap(e) {
    if (this.data.selectMode) {
      this.selectAddress(e);
    }
  }
});