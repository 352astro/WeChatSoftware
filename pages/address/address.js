import request from '../../utils/request.js';

Page({
  data: {
    addressList: []
  },

  onShow() {
    this.fetchAddressList();
  },

  // 1. 查询所有地址
  fetchAddressList() {
    request({ url: '/api/address/list', method: 'GET' })
      .then(res => {
        if (res.data.code === 0) {
          this.setData({ addressList: res.data.data });
        }
      });
  },

  // 2. 设置默认地址
  setDefault(e) {
    const id = e.currentTarget.dataset.id;
    request({
      url: `/api/address/default?id=${id}`, // 对照文档 query 参数
      method: 'PUT'
    }).then(() => this.fetchAddressList());
  },

  // 3. 删除地址
  deleteAddress(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '提示',
      content: '确认删除该地址吗？',
      success: (res) => {
        if (res.confirm) {
          request({
            url: `/api/address?id=${id}`, // 对照文档 query 参数
            method: 'DELETE'
          }).then(() => this.fetchAddressList());
        }
      }
    });
  },

  // 跳转新增
  addAddress() {
    wx.navigateTo({ url: '/pages/address-edit/address-edit' });
  },

  // 跳转编辑（携带数据）
  editAddress(e) {
    const item = e.currentTarget.dataset.item;
    // 将对象转为字符串传递，或存入全局变量
    wx.navigateTo({
      url: `/pages/address-edit/address-edit?id=${item.id}&consignee=${item.consignee}&phone=${item.phone}&detailAddress=${item.detailAddress}&label=${item.label}`
    });
  }
});