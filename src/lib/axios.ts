import Axios from "axios"

export const axios = Axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "/api",
  timeout: 15000,
})

axios.interceptors.response.use(
  (r) => r,
  (err) => {
    // centralize logging for later
    return Promise.reject(err)
  }
)

