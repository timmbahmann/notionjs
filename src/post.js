import axios from 'axios'
axios.defaults.withCredentials = true

const defaultData = {
  limit: 10000,
  cursor: { stack: [] },
  chunkNumber: 0,
  verticalColumns: false
}

const defaultOptions = {}

export default async function post(url, data = {}, options = {}) {
  const request = axios.create({
    baseURL: process.env.API_BASE_URL || 'https://www.notion.so/api/v3/'
  })

  const response = await request.post(
    url,
    { ...defaultData, ...data },
    { ...defaultOptions, ...options }
  )
  if (response.status != 200) {
    throw new Error(
      `We got a ${response.status} trying to post ${url} with data: ${data} and options: ${options} `
    )
  }

  return response
}
