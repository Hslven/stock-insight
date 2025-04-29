import axios, {
  AxiosInstance,
  AxiosError,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from "axios";
import { useNavigate } from "react-router-dom";
import { addToast } from "@heroui/react";

import { stringify } from "@/lib/utils";

const config = {
  // 设置超时时间（10s）
  timeout: 10e3,
  // 跨域时候允许携带凭证
  withCredentials: true,
  // baseURL: import.meta.env.VITE_API_URL,
};

class RequestHttp {
  service: AxiosInstance;
  public constructor(config: AxiosRequestConfig) {
    // 实例化axios
    this.service = axios.create(config);

    /**
     * @description 请求拦截器
     * 客户端发送请求 -> [请求拦截器] -> 服务器
     * token校验(JWT) : 接受服务器返回的token,存储到vuex/pinia/本地储存当中
     */
    this.service.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        return config;
      },
      (error: AxiosError) => {
        return Promise.reject(error);
      },
    );

    /**
     * @description 响应拦截器
     *  服务器换返回信息 -> [拦截统一处理] -> 客户端JS获取到信息
     */
    this.service.interceptors.response.use(
      (response: AxiosResponse) => {
        const { data } = response;

        // * 登陆失效（code == 300004）
        if (data.code == 401 || data.code === 400001) {
          // errorNotification(data.msg);
          setTimeout(() => {
            return Promise.reject(data);
          }, 200);
        } else if (data.code && data.code !== 200) {
          addToast({
            title: "错误提示",
            description: data.msg,
            color: "danger",
          });

          return Promise.reject(data);
        }
        // * 文件导出处理
        if (response.config?.headers?.responseType === "blob") {
          let fileName = "";

          if (response?.headers["content-disposition"]?.includes("filename=")) {
            fileName = decodeURI(
              response.headers["content-disposition"],
            )?.split("filename=")[1];
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
        }

        // * 成功请求（在页面上除非特殊情况，否则不用在页面处理失败逻辑）
        return data;
      },
      async (error: AxiosError) => {
        const { response } = error;

        // 请求超时 && 网络错误单独判断，没有 response
        // if (error.message.indexOf("timeout") !== -1)
        // if (error.message.indexOf("Network Error") !== -1)
        // 根据响应的错误状态码，做不同的处理
        // if (response) checkStatus(response.status);
        response &&
          addToast({
            title: "Toast",
            description: error.message,
            color: "danger",
          });
        // 服务器结果都没有返回(可能服务器错误可能客户端断网)，断网处理:可以跳转到断网页面
        // if (!window.navigator.onLine) navigate("/500", { replace: true });

        return Promise.reject(error);
      },
    );
  }

  getResponseType(config: AxiosRequestConfig) {
    return config?.responseType || undefined;
  }

  // GET请求
  get<T>(url: string, params?: object, config = {}): Promise<ResultData<T>> {
    return this.service.get(
      url +
        (Object.keys(params || {}).length
          ? "?" + stringify(params, { arrayFormat: "repeat", skipNulls: true })
          : ""),
      {
        responseType: this.getResponseType(config),
        headers: {
          noLoading: false,
          ...config,
        },
      },
    );
  }
  // POST请求
  post<T>(url: string, data?: object, config = {}): Promise<ResultData<T>> {
    return this.service.post(url, data, {
      responseType: this.getResponseType(config),
      headers: {
        noLoading: false,
        ...config,
      },
    });
  }
  // PUT请求
  put<T>(url: string, data?: object, config = {}): Promise<ResultData<T>> {
    return this.service.put(url, data, {
      responseType: this.getResponseType(config),
      headers: {
        noLoading: false,
        ...config,
      },
    });
  }
  // PATCH请求
  patch<T>(url: string, data?: object, config = {}): Promise<ResultData<T>> {
    return this.service.patch(url, data, {
      responseType: this.getResponseType(config),
      headers: {
        noLoading: false,
        ...config,
      },
    });
  }
  // DELETE请求
  delete<T>(url: string, data?: object, config = {}): Promise<ResultData<T>> {
    return this.service.delete(url, {
      data,
      responseType: this.getResponseType(config),
      headers: {
        noLoading: false,
        ...config,
      },
    });
  }
  // DOWNLOAD请求
  download<T>(
    url: string,
    params?: object,
    config = {},
  ): Promise<ResultData<T>> {
    return this.service.get(url, {
      params,
      responseType: "blob",
      headers: {
        noLoading: false,
        responseType: "blob",
        ...config,
      },
    });
  }
}

export default new RequestHttp(config);
