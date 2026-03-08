// pages/pattern-library/pattern-library.js
Page({
  data: {
    statusBarHeight: 20,
    navHeight: 64,
    categories: [
      {
        name: '花朵纹样',
        patterns: [
          {
            id: 'p001',
            name: '菊花',
            thumb: 'http://localhost:8080/files/chm.png' 
          },
          {
            id: 'p002',
            name: '兰花',
            thumb: 'http://localhost:8080/files/ord.png' // TODO: 填入回纹图片路径
          },
          {
            id: 'p003',
            name: '梅枝',
            thumb: 'http://localhost:8080/files/pbm.png' // TODO: 填入龙纹图片路径
          },
          {
            id: 'p004',
            name: '梅花',
            thumb: 'http://localhost:8080/files/pbm-2.png' // TODO: 填入凤纹图片路径
          },
          {
            id: 'p005',
            name: '桃花',
            thumb: 'http://localhost:8080/files/phm.png'
          },
          {
            id: 'p006',
            name: '枣花',
            thumb: 'http://localhost:8080/files/dte.png' // TODO: 填入祥云纹图片路径
          }
        ]
      },
      {
        name: '动物纹样',
        patterns: [
          {
            id: 'p101',
            name: '蝴蝶',
            thumb: 'http://localhost:8080/files/bfy.png' // TODO: 填入蝴蝶图片路径
          },
          {
            id: 'p102',
            name: '孔雀',
            thumb: 'http://localhost:8080/files/pck.png' // TODO: 填入孔雀图片路径
          },
          {
            id: 'p103',
            name: '蛙',
            thumb: 'http://localhost:8080/files/frg.png' // TODO: 填入牡丹纹图片路径
          },
          {
            id: 'p104',
            name: '虾',
            thumb: 'http://localhost:8080/files/srp.png' // TODO: 填入竹纹图片路径
          },
          {
            id: 'p105',
            name: '蟹',
            thumb: 'http://localhost:8080/files/crb.png' // TODO: 填入竹纹图片路径
          }
        ]
      },
    ]
  },

  onLoad() {
    const { statusBarHeight } = wx.getSystemInfoSync();
    // 44px 为顶部栏内容高度（88rpx ≈ 44px in 2x screen）
    this.setData({ statusBarHeight, navHeight: statusBarHeight + 44 });
  },

  // 点击花纹：将图片路径写入 Storage，供 carve 页面使用
  onPatternTap(e) {
    const pattern = e.currentTarget.dataset.pattern;
    if (!pattern.thumb) {
      wx.showToast({ title: '图片尚未配置', icon: 'none' });
      return;
    }
    wx.setStorageSync('selected_pattern', pattern);
    wx.showToast({ title: `已选择「${pattern.name}」`, icon: 'success' });
    setTimeout(() => wx.navigateBack({ delta: 1 }), 800);
  },

  goBack() {
    wx.navigateBack({ delta: 1 });
  }
});
