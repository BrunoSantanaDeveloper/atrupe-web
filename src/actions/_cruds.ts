/* eslint-disable  @typescript-eslint/no-explicit-any */
'use server'

// Lib Imports
import apiInstance from '@/lib/api'
import { defaultRoutes } from './routes'

const defaultRoute = defaultRoutes()

const extractApiErrorMessage = (payload: any) => {
  const userMessage = payload?.userMessage
  const message =
    userMessage?.message ||
    payload?.message ||
    payload?.data?.message ||
    payload?.data?.error ||
    userMessage

  return Array.isArray(message)
    ? message[0]
    : typeof message === 'string'
      ? message
      : 'Erro desconhecido.'
}

const getEmbeddedError = (payload: any) => {
  const statusCode = Number(
    payload?.statusCode || payload?.userMessage?.statusCode,
  )

  if (!Number.isFinite(statusCode) || statusCode < 400) return null

  return {
    status: statusCode,
    code: statusCode,
    message: extractApiErrorMessage(payload),
  }
}

// LISTAR ❌ Não usar mais (TODO: Excluir este depois de refatorar onde é usado)
export const getDataOld = async ({
  route,
  filters,
  perPage,
  customPath,
}: {
  route?: string
  filters?: { [key: string]: string | boolean | undefined }
  perPage?: string
  customPath?: string
}) => {
  try {
    const api = await apiInstance()

    const params = filters
      ? Object.fromEntries(
          Object.entries(filters).filter(
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            ([_, value]) =>
              value !== null && value !== '' && value !== undefined,
          ),
        )
      : {}

    if (perPage) params.limit = perPage

    const url = ((route && defaultRoute[route]) || '') + (customPath || '')

    if (!url) console.error('Rota principal não definida ou não existe:', route)

    const res = await api.get(url, { params })

    return res.data
  } catch (error: any) {
    // Re-throw Next.js redirect errors (ex: redirect('/logout') no interceptor)
    if (error?.digest?.startsWith?.('NEXT_REDIRECT')) throw error
    console.error(
      `Erro em getDataOld [${route}]:`,
      error?.response?.status,
      error?.message,
    )
    return null
  }
}

// LISTAR (usar sempre este em vez de getDataOld)
export const getData = async ({
  route,
  filters,
  perPage,
}: {
  route: string
  filters?: { [key: string]: string | boolean | undefined }
  perPage?: string
}) => {
  const api = await apiInstance()

  const params = filters
    ? Object.fromEntries(
        Object.entries(filters).filter(
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          ([_, value]) => value !== null && value !== '' && value !== undefined,
        ),
      )
    : {}

  if (perPage) params.limit = perPage

  // const res = await api.get(route, { params })

  // return res.data

  try {
    const res = await api.get(route, { params })

    return {
      success: true,
      message: 'Dados carregados com sucesso!',
      page: res.data.page,
      lastPage: res.data.lastPage || res.data.totalPages,
      total: res.data.total,
      data: res.data.data || res.data,
    }
  } catch (error: any) {
    if (error?.digest?.startsWith?.('NEXT_REDIRECT')) throw error
    const userMessage = error?.response?.data?.userMessage
    const responseData = error?.response?.data
    const responseMessage =
      userMessage?.message ||
      userMessage ||
      responseData?.message ||
      responseData?.data?.message ||
      responseData?.data?.error ||
      error?.message

    return {
      success: false,
      code:
        userMessage?.statusCode ||
        responseData?.statusCode ||
        error?.response?.status ||
        'unknown',
      message: Array.isArray(responseMessage)
        ? responseMessage[0]
        : responseMessage || 'Erro desconhecido.',
    }
  }
}

// BUSCAR POR ID ❌ Não usar mais (TODO: Excluir este depois de refatorar onde é usado)
export const getItemOld = async ({
  route,
  id,
}: {
  route: string
  id: string | number
}) => {
  try {
    const api = await apiInstance()

    const url = `${defaultRoute[route]}/${id}`

    const res = await api.get(url)

    return res.data
  } catch (error: any) {
    if (error?.digest?.startsWith?.('NEXT_REDIRECT')) throw error
    console.error(
      `Erro em getItemOld [${route}/${id}]:`,
      error?.response?.status,
      error?.message,
    )
    return null
  }
}

// BUSCAR POR ID (usar sempre este em vez de getItemOld)
export const getItem = async ({
  route,
  params,
}: {
  route: string
  params?: { [key: string]: string | boolean | undefined }
}) => {
  const api = await apiInstance()

  try {
    const res = await api.get(route, { params })

    return {
      success: true,
      message: 'Item encontrado com sucesso!',
      data: res.data,
    }
  } catch (error: any) {
    if (error?.digest?.startsWith?.('NEXT_REDIRECT')) throw error
    const userMessage = error?.response?.data?.userMessage

    return {
      success: false,
      code: userMessage?.statusCode || 'unknown',
      message: userMessage?.message || 'Erro desconhecido.',
    }
  }
}

// CRIAR ❌ Não usar mais (TODO: Excluir este depois de refatorar onde é usado)
export const createItem = async ({
  route,
  data,
  customPath,
}: {
  route?: string
  data?: unknown
  customPath?: string
}) => {
  const api = await apiInstance()

  const url = ((route && defaultRoute[route]) || '') + (customPath || '')

  try {
    const res = await api.post(url, data)

    return res.data
  } catch (error: any) {
    if (error?.digest?.startsWith?.('NEXT_REDIRECT')) throw error
    const rawData = error.response?.data
    const extractedMsg =
      rawData?.message ||
      rawData?.data?.message ||
      rawData?.userMessage?.message ||
      error.message ||
      'Erro ao processar requisição'

    const finalMsg = Array.isArray(extractedMsg)
      ? extractedMsg[0]
      : extractedMsg
    throw new Error(
      typeof finalMsg === 'string' ? finalMsg : JSON.stringify(finalMsg),
    )
  }
}

// CRIAR NOVO (usar sempre este em vez de createItem)
export const createItemNew = async ({
  route,
  data,
  headers,
}: {
  route: string
  data?: unknown
  headers?: Record<string, string>
}) => {
  const api = await apiInstance()

  try {
    const res = await api.post(route, data, { headers })
    const embeddedError = getEmbeddedError(res.data)

    if (embeddedError) {
      return {
        success: false,
        ...embeddedError,
      }
    }

    return {
      success: true,
      message: 'Item criado com sucesso!',
      data: res.data,
    }
  } catch (error: any) {
    if (error?.digest?.startsWith?.('NEXT_REDIRECT')) throw error
    const userMessage = error?.response?.data?.userMessage

    return {
      success: false,
      status: error?.response?.status,
      code: userMessage?.statusCode || 'unknown',
      message:
        userMessage?.message ||
        error?.response?.data?.message ||
        'Erro desconhecido.',
    }
  }
}

// EDITAR ❌ Não usar mais (TODO: Excluir este depois de refatorar onde é usado)
export const updateItem = async (
  route: string,
  id: string | number,
  data: unknown,
) => {
  const api = await apiInstance()

  const url = `${defaultRoute[route]}/${id}`

  try {
    const res = await api.patch(url, data)
    return res.data
  } catch (error) {
    // Propagando o erro para que possa ser tratado pelos handlers de erro
    console.error(`Erro ao atualizar item na rota ${url}:`)
    throw error
  }
}

// EDITAR NOVO (usar sempre este em vez de updateItem)
export const updateItemNew = async ({
  route,
  data,
}: {
  route: string
  data: unknown
}) => {
  const api = await apiInstance()

  try {
    const res = await api.patch(route, data)

    return {
      success: true,
      message: 'Item atualizado com sucesso!',
      data: res.data,
    }
  } catch (error: any) {
    if (error?.digest?.startsWith?.('NEXT_REDIRECT')) throw error
    const userMessage = error?.response?.data?.userMessage

    return {
      success: false,
      code: userMessage?.statusCode || 500,
      message: userMessage?.message || 'Erro desconhecido.',
    }
  }
}

// EXCLUIR ❌ Não usar mais (TODO: Excluir este depois de refatorar onde é usado)
export const deleteItem = async (route: string, id?: string | number) => {
  const api = await apiInstance()

  const url = `${defaultRoute[route]}/${id}`

  const res = await api.delete(url)

  return res.data
}

// EXCLUIR NOVO (usar sempre este em vez de deleteItem)
export const deleteItemNew = async ({
  route,
  params,
}: {
  route: string
  params?: unknown
}) => {
  const api = await apiInstance()

  // const url = `${defaultRoute[route]}/${id}`

  try {
    const res = await api.delete(route, { params })

    return {
      success: true,
      message: 'Item excluído com sucesso!',
      data: res.data,
    }
  } catch (error: any) {
    if (error?.digest?.startsWith?.('NEXT_REDIRECT')) throw error
    const userMessage = error?.response?.data?.userMessage

    return {
      success: false,
      code: userMessage?.statusCode || 500,
      message: userMessage?.message || 'Erro desconhecido.',
    }
  }
}

// EXCLUIR COM BODY (usar quando precisa enviar dados no corpo da requisição)
export const deleteWithBody = async ({
  route,
  data,
}: {
  route: string
  data: unknown
}) => {
  const api = await apiInstance()

  try {
    const res = await api.delete(route, { data })

    return {
      success: true,
      message: 'Item excluído com sucesso!',
      data: res.data,
    }
  } catch (error: any) {
    if (error?.digest?.startsWith?.('NEXT_REDIRECT')) throw error
    const userMessage = error?.response?.data?.userMessage

    return {
      success: false,
      code: userMessage?.statusCode || 500,
      message: userMessage?.message || 'Erro desconhecido.',
    }
  }
}

export const uploadFile = async (route: string, data: FormData) => {
  const api = await apiInstance()

  // Convert file to plain object before appending
  // const plainFile = new Blob([file], { type: file.type })

  try {
    const response = await api.post(route, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    return response.data
  } catch (error: any) {
    if (error?.digest?.startsWith?.('NEXT_REDIRECT')) throw error
    const caughtError =
      error.response?.data?.data?.message ||
      error.response?.data?.message ||
      error.message ||
      error
    console.error('Error:', caughtError)
    throw caughtError
  }
}

// Helper to encode file as Base64
export const encodeFileToBase64 = async (file: Blob) => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result?.toString().split(',')[1] || '')
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// export const uploadFile = async (
//   route: string,
//   data: FormData,
//   customPath?: string,
// ) => {
//   const api = await apiInstance()

//   // Convert file to plain object before appending
//   // const plainFile = new Blob([file], { type: file.type })

//   const url = ((route && defaultRoute[route]) || '') + (customPath || '')

//   try {
//     const response = await api.post(url, data, {
//       headers: {
//         'Content-Type': 'multipart/form-data',
//       },
//     })

//     return response.data
//   } catch (error: any) {
//     const caughtError =
//       error.response?.data?.data?.message ||
//       error.response?.data?.message ||
//       error.message ||
//       error
//     console.error('Error:', caughtError)
//     throw new Error(caughtError)
//   }
// }
