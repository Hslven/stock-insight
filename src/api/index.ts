import { createAlova } from "alova";
import fetchAdapter from "alova/fetch";
import reactHook from "alova/react";
import { addToast } from "@heroui/react";

import { createApis, withConfigType } from "./createApis";

export const alovaInstance = createAlova({
  baseURL: "",
  statesHook: reactHook,
  timeout: 10e3,
  cacheFor: {
    GET: 60 * 60 * 1000,
  },
  requestAdapter: fetchAdapter(),
  beforeRequest: (method) => {
    // 假设我们需要添加token到请求头
    // method.config.headers.token = "token";
  },

  responded: {
    // 请求成功的拦截器
    // 当使用 `alova/fetch` 请求适配器时，第一个参数接收Response对象
    // 第二个参数为当前请求的method实例，你可以用它同步请求前后的配置信息
    onSuccess: async (response, method) => {
      if (response.status >= 400) {
        throw new Error(response.statusText);
      }
      const json = await response.json();

      if (json.code !== 200) {
        // 抛出错误或返回reject状态的Promise实例时，此请求将抛出错误
        throw new Error(json.message);
      }

      // 解析的响应数据将传给method实例的transform钩子函数，这些函数将在后续讲解
      return json;
    },

    // 请求失败的拦截器
    // 请求错误时将会进入该拦截器。
    // 第二个参数为当前请求的method实例，你可以用它同步请求前后的配置信息
    onError: (err, method) => {
      addToast({
        title: "错误提示",
        description: err.message,
        color: "danger",
      });
    },

    // 请求完成的拦截器
    // 当你需要在请求不论是成功、失败、还是命中缓存都需要执行的逻辑时，可以在创建alova实例时指定全局的`onComplete`拦截器，例如关闭请求 loading 状态。
    // 接收当前请求的method实例
    onComplete: async (response) => {
      const { data } = response;

      // // 处理请求完成逻辑
      // // * 登陆失效（code == 300004）
      // if (data.code == 401 || data.code === 400001) {
      //   // errorNotification(data.msg);
      //   setTimeout(() => {
      //     return Promise.reject(data);
      //   }, 200);
      // } else if (data.code && data.code !== 200) {
      //   addToast({
      //     title: "错误提示",
      //     description: data.msg,
      //     color: "danger",
      //   });

      //   return Promise.reject(data);
      // }
      // * 文件导出处理
      /*       if (response.config?.headers?.responseType === "blob") {
        let fileName = "";

        if (response?.headers["content-disposition"]?.includes("filename=")) {
          fileName = decodeURI(response.headers["content-disposition"])?.split(
            "filename=",
          )[1];
        }
        const content = data;
        const contentType = response?.headers?.["content-type"] ?? "";
        const blob = new Blob([content], { type: contentType });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.style.display = "none";
        link.href = url;
        link.download = fileName || new Date().getTime().toString();
        document.body.appendChild(link);
        link.click();
        link.remove();
        addToast({
          title: "Toast",
          description: "Export Success",
          color: "success",
        });
      } */

      // * 成功请求（在页面上除非特殊情况，否则不用在页面处理失败逻辑）
      return data;
    },
  },
});
/** 元数据 */
export const $$userConfigMap = withConfigType({});

const Apis = createApis(alovaInstance, $$userConfigMap);

export default Apis;
