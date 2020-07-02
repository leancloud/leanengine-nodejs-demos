const AV = require("leanengine");
const { redisClient } = require("./redis");
const { nanoid } = require("nanoid");

AV.Cloud.define("requestLoginByApp", async (request) => {
  const token = nanoid();
  await redisClient.set(`loginByAppToken:${token}`, "incoming", "EX", 3600);
  return token;
});

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
