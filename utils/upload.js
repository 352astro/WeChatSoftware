// upload.js

const BASE_URL = 'http://localhost:8080';

/**
 * 文件上传封装
 * @param {Object} options
 * @param {String} options.url   接口路径
 * @param {String} options.filePath  本地文件路径
 * @param {String} options.name  文件字段名（默认 file）
 * @param {Object} options.formData  额外表单数据
 * @param {Object} options.header 自定义 header
 */
const upload = (options) => {
  return new Promise((resolve, reject) => {

    const token = wx.getStorageSync('token');

    let customHeader = {
      'authentication': token
      // ❗ 不要手动设置 Content-Type
    };

    wx.uploadFile({
      url: BASE_URL + options.url,
      filePath: options.filePath,
      name: options.name || 'file',
      formData: options.formData || {},
      header: customHeader,

      success: (res) => {
        // 后端通常返回 JSON 字符串，需要解析
        try {
          const data = JSON.parse(res.data);
          resolve(data);
        } catch (e) {
          resolve(res);
        }
      },

      fail: (err) => {
        reject(err);
      }
    });

  });
};

export default upload;