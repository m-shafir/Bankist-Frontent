import axios from "axios";

export const commonAPI = (httpRequest, url, reqBody) => {
  const requestConfig = {
    method: httpRequest,
    url,
    data: reqBody,
  };
  return axios(requestConfig)
    .then((res) => res)
    .catch((err) => err);
};
