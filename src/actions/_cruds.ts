/* eslint-disable  @typescript-eslint/no-explicit-any */
'use server'

// Lib Imports
import apiInstance from '@/lib/api'
import { defaultRoutes } from './routes'

const defaultRoute = defaultRoutes()

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

  const url = ((route && defaultRoute[route]) || '') + (customPath || '')

  if (!url) console.error('Rota principal não definida ou não existe:', route)

  const res = await api.get(url, { params })

  return res.data
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
      data: res.data.data,
    }
  } catch (error: any) {
    const userMessage = error?.response?.data?.userMessage

    return {
      success: false,
      code: userMessage?.statusCode || 'unknown',
      message: userMessage?.message || 'Erro desconhecido.',
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
  const api = await apiInstance()

  const url = `${defaultRoute[route]}/${id}`

  const res = await api.get(url)

  return res.data
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
    throw Error(error.response.data.data.message)
  }
}

// CRIAR NOVO (usar sempre este em vez de createItem)
export const createItemNew = async ({
  route,
  data,
}: {
  route: string
  data?: unknown
}) => {
  const api = await apiInstance()

  try {
    const res = await api.post(route, data)

    return {
      success: true,
      message: 'Item criado com sucesso!',
      data: res.data,
    }
  } catch (error: any) {
    const userMessage = error?.response?.data?.userMessage

    return {
      success: false,
      code: userMessage?.statusCode || 'unknown',
      message: userMessage?.message || 'Erro desconhecido.',
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
  id,
}: {
  route: string
  id: string | number
}) => {
  const api = await apiInstance()

  const url = `${defaultRoute[route]}/${id}`

  try {
    const res = await api.delete(url)

    return {
      success: true,
      message: 'Item excluído com sucesso!',
      data: res.data,
    }
  } catch (error: any) {
    const userMessage = error?.response?.data?.userMessage

    return {
      success: false,
      code: userMessage?.statusCode || 500,
      message: userMessage?.message || 'Erro desconhecido.',
    }
  }
}

export const uploadFile = async (
  route: string,
  data: FormData,
  customPath?: string,
) => {
  const api = await apiInstance()

  // Convert file to plain object before appending
  // const plainFile = new Blob([file], { type: file.type })

  const url = ((route && defaultRoute[route]) || '') + (customPath || '')

  try {
    const response = await api.post(url, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    return response.data
  } catch (error: any) {
    const caughtError =
      error.response?.data?.data?.message ||
      error.response?.data?.message ||
      error.message ||
      error
    console.error('Error:', caughtError)
    throw caughtError
  }
}

// export const uploadFile = async (
//   route: string,
//   fileBase64: string, // Serializable Base64
//   fileType: string, // Add type to reconstruct Blob
//   customPath?: string,
// ) => {
//   try {
//     const api = await apiInstance()

//     // Recreate the Blob from Base64
//     const binary = atob(fileBase64)
//     const array = Uint8Array.from(binary, (char) => char.charCodeAt(0))
//     const plainFile = new Blob([array], { type: fileType })

//     // Create FormData
//     const formData = new FormData()
//     formData.append('image', plainFile)

//     const url = ((route && defaultRoute[route]) || '') + (customPath || '')
//     const response = await api.post(url, formData, {
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
//     throw caughtError
//   }
// }

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
