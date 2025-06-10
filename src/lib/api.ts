// Third-party Imports
import axios from 'axios'

// Lib Imports
import { auth } from '@/lib/auth'

const apiUrl = process.env.NEXT_PUBLIC_API_URL

export default async function apiInstance() {
  const session = await auth()
  const token = session?.accessToken || null

  const devEnv = process.env.NODE_ENV === 'development'

  const api = axios.create({
    baseURL: apiUrl,
    headers: {
      common: {
        'Content-Type': 'application/json',
        Authorization: token || '',
        'ngrok-skip-browser-warning': 'any',
      },
    },
  })

  api.interceptors.request.use((request) => {
    const { method, baseURL, url, params, data } = request

    if (devEnv && process.env.SHOW_API_REQUEST_LOG === 'true') {
      console.log('🛑 Requisição:', {
        method,
        url: `${baseURL}${url}`,
        params,
        // headers: request.headers,
        data,
      })
    }

    return request
  })

  api.interceptors.response.use(
    (response) => {
      if (devEnv && process.env.SHOW_API_RESPONSE_LOG === 'true') {
        console.log('🛑 Resposta:', JSON.stringify(response.data, null, 2))
      }

      return response
    },
    (error) => {
      if (devEnv && process.env.SHOW_API_ERROR_LOG === 'true') {
        const message =
          error.response?.data?.userMessage?.message ||
          error.response?.data?.message ||
          error.response?.data?.data?.message ||
          error.response?.data?.data?.error ||
          error.response?.data?.data ||
          error.response?.data ||
          'Unknown error'

        console.log('🛑 Erro:', {
          status: error.response?.status + ' - ' + error.response?.statusText,
          message,
        })
      }
      return Promise.reject(error)
    },
  )

  return api
}
