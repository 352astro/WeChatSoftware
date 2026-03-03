import request from '../../utils/request.js';

Page({
  data: {
    workList: [],
    leftList: [],
    rightList: []
  },

  /**
 * 页面显示时触发的生命周期回调，用于拉取并更新最新的作品列表
 * @returns {void} 无返回值
 * @throws {Error} 当调用内部方法获取作品列表时发生网络或数据处理错误可能抛出异常
 */
onShow() {
    this.fetchWorkList();
  },

  // 获取作品集列表
  fetchWorkList() {
    this.setData({ isLoading: true });
    wx.showLoading({ title: '加载中...' });

    // 对接接口 GET /api/work/list
    request({
      url: '/api/work/list',
      method: 'GET'
    })
      .then(res => {
        wx.hideLoading();
        if (res.data.code === 0) {
          const list = res.data.data || [];
          // 关键点：必须更新 workList 才能让 WXML 中的 wx:if 恢复正常
          this.setData({
            workList: list,
            isLoading: false
          });
          this.splitList(list);
        }
      })
      .catch(() => {
        wx.hideLoading();
        // 模拟测试数据逻辑
        const mockData = [
          { title: '锦绣团花', imageUrl: '/assets/mock/m1.png', userId: 886 },
          { title: '岁寒三友', imageUrl: '/assets/mock/m2.png', userId: 886 },
          { title: '龙凤呈祥', imageUrl: '/assets/mock/m3.png', userId: 886 }
        ];
        this.setData({
          workList: mockData,
          isLoading: false
        });
        this.splitList(mockData);
      });
  },

  // 简单的瀑布流分列算法
  splitList(list) {
    let left = [];
    let right = [];
    list.forEach((item, index) => {
      if (index % 2 === 0) {
        left.push(item);
      } else {
        right.push(item);
      }
    });
    this.setData({
      leftList: left,
      rightList: right
    });
  }
});