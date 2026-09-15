/** 平台登录能力：获取微信登录凭证，不属于 HTTP 接口层。 */
export const getWeChatCode = (): Promise<string> =>
  new Promise((resolve, reject) => {
    uni.login({
      provider: "weixin",
      success(result) {
        if (result.code) resolve(result.code);
        else reject(new Error("未获取到微信登录凭证，请重试"));
      },
      fail() {
        reject(new Error("微信登录失败，请重试"));
      },
    });
  });
