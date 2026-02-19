// 全局基础 URL，记得换成你自己的 Java 后端地址
const BASE_URL = 'http://localhost:8080'; 

/**
 * 核心请求封装
 * @param {Object} options 请求配置项
 */
const request = (options) => {
  return new Promise((resolve, reject) => {
    const token = wx.getStorageSync('token');

    // 预先处理好 header
    let customHeader = {
      'Content-Type': 'application/json',
      'Authorization': token ? 'Bearer ' + token : ''
    };

    // 使用 Object.assign 代替 ... 展开运算符
    if (options.header) {
      Object.assign(customHeader, options.header);
    }

    wx.request({
      url: BASE_URL + options.url,
      method: options.method || 'GET',
      data: options.data || {},
      header: customHeader, // 直接使用组合好的对象
      success: (res) => {
        resolve(res);
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
};

export default request;