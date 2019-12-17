const axios = require("axios").default;

const defaultData = {
  limit: 10000,
  cursor: { stack: [] },
  chunkNumber: 0,
  verticalColumns: false
};

const defaultOptions = {};

function generatePost(token_v2) {
  const request = axios.create({
    baseURL: process.env.API_BASE_URL || "https://www.notion.so/api/v3/",
    headers: {
      cookie: `token_v2=${token_v2 || process.env.TOKEN_V2};`
    }
  });
  return async function post(url, data = {}, options = {}) {
    const response = await request.post(
      url,
      { ...defaultData, ...data },
      { ...defaultOptions, ...options }
    );
    if (response.status != 200) {
      throw new Error(
        `We got a ${response.status} trying to post ${url} with data: ${data} and options: ${options} `
      );
    }

    return response;
  };
}

module.exports = generatePost;
