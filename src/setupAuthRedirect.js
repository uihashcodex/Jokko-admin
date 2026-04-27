import axios from "axios";
import { isAuthLoginRequestUrl, redirectToLogin } from "./redirectToLogin";

function axiosRequestUrl(config) {
  if (!config) return "";
  const base = config.baseURL || "";
  const path = config.url || "";
  return `${base}${path}`.replace(/\s/g, "");
}

function fetchInputUrl(input) {
  if (typeof input === "string") return input;
  if (input instanceof Request) return input.url;
  return String(input);
}

// Global axios: all `import axios from "axios"` calls share the default instance.
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const url = axiosRequestUrl(error?.config);
    if (status === 401 && !isAuthLoginRequestUrl(url)) {
      redirectToLogin();
    }
    return Promise.reject(error);
  }
);

const nativeFetch = window.fetch.bind(window);
window.fetch = async (input, init) => {
  const res = await nativeFetch(input, init);
  if (res.status === 401) {
    const url = fetchInputUrl(input);
    if (!isAuthLoginRequestUrl(url)) {
      redirectToLogin();
    }
  }
  return res;
};
