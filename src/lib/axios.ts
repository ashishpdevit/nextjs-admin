import Axios from "axios"

export const axios = Axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "/api",
  timeout: 15000,

  headers: {
    "Content-Type": "application/json",
  },
})

// Set authorization header dynamically
axios.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("auth_token")
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

axios.interceptors.response.use(
  (r) => r,
  (err) => {
    // centralize logging for later
    return Promise.reject(err)
  }
)

