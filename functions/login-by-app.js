const AV = require("leanengine");
const { redisClient } = require("./redis");
const { nanoid } = require("nanoid");

/*
 * 供网站调用，返回一个随机 token，网站可以将 token 转换为二维码。
 */
AV.Cloud.define("requestLoginByApp", async (request) => {
  const token = nanoid();
  await redisClient.set(`loginByAppToken:${token}`, "incoming", "EX", 3600);
  return token;
});

/*
 * 供移动端应用调用，参数为（通过扫描二维码获得的）token。
 * 用户在移动端应用需处于已登陆状态。
 */
AV.Cloud.define("verifyByApp", async (request) => {
  const token = request.params.token;
  const incoming = await redisClient.get(`loginByAppToken:${token}`);
  if (incoming === "incoming") {
    await redisClient.set(
      `loginByAppToken:${token}`,
      request.sessionToken,
      "EX",
      3600
    );
    return "OK";
  } else {
    throw new AV.Cloud.Error(
      `Verification failed. Possible cause: token is invalid or expired.`
    );
  }
});

/*
 * 供网站调用，返回 sessionToken。网站凭 sessionToken 调用 AV.User.become 方法完成登录。
 */
AV.Cloud.define("loginByApp", async (request) => {
  const token = request.params.token;
  const sessionToken = await redisClient.get(`loginByAppToken:${token}`);
  if (sessionToken === null) {
    throw new AV.Cloud.Error(
      "Failed to login. Possible cause: token is invalid or expired."
    );
  } else if (sessionToken === "incoming") {
    throw new AV.Cloud.Error("Not verified by the corresponding App yet.");
  } else {
    return sessionToken;
  }
});
