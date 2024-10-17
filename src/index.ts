import * as querystring from "querystring";
import * as https from "https";
const crypto = require("crypto");
import { appId, appSecret } from "./private";
type BaiduResult = {
  error_code?: string;
  error_meg?: string;
  from: string;
  to: string;
  trans_result: { src: string; dst: string }[];
};
export const translate = (word: any) => {
  // 请求参数

  const query = word;
  const fromLanguage = "en";
  const toLanguage = "zh";
  const salt = Math.random(); // 计算签名（MD5加密）

  const sign = crypto
    .createHash("md5")
    .update(appId + query + salt + appSecret)
    .digest("hex");

  // 构建请求参数
  const params = {
    q: query,
    from: fromLanguage,
    to: toLanguage,
    appid: appId,
    salt: salt,
    sign: sign
  };

  // 将请求参数编码成查询字符串
  const queryString = querystring.stringify(params);

  // 构建请求选项
  const options = {
    hostname: "api.fanyi.baidu.com",
    path: "/api/trans/vip/translate?" + queryString,
    method: "GET"
  };

  // 发送请求
  const req = https.request(options, res => {
    let data = "";

    res.on("data", chunk => {
      data += chunk;
    });

    res.on("end", () => {
      console.log(data);
      const object: BaiduResult = JSON.parse(data);
      console.log(object);
      console.log(object.trans_result[0].dst);
    });
  });

  req.on("error", error => {
    console.error("请求出错:" + error.message);
  });

  req.end();
};
