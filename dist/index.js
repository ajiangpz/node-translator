"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.translate = void 0;
const querystring = __importStar(require("querystring"));
const https = __importStar(require("https"));
const crypto = require("crypto");
const private_1 = require("./private");
const translate = (word) => {
    // 请求参数
    const query = word;
    const fromLanguage = "en";
    const toLanguage = "zh";
    const salt = Math.random(); // 计算签名（MD5加密）
    const sign = crypto
        .createHash("md5")
        .update(private_1.appId + query + salt + private_1.appSecret)
        .digest("hex");
    // 构建请求参数
    const params = {
        q: query,
        from: fromLanguage,
        to: toLanguage,
        appid: private_1.appId,
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
            const object = JSON.parse(data);
            console.log(object);
            console.log(object.trans_result[0].dst);
        });
    });
    req.on("error", error => {
        console.error("请求出错:" + error.message);
    });
    req.end();
};
exports.translate = translate;
