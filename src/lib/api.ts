// Third-party
import axios, { AxiosError } from 'axios'

// Libs
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

const apiUrl = process.env.API_URL

// 401 da senha gerencial do painel de planos: é a senha digitada que falta ou
// está errada, não a sessão. O painel mostra o erro no diálogo.
const PASSWORD_ERROR_CODES = ['PASSWORD_REQUIRED', 'INVALID_PASSWORD']

// Função auxiliar para verificar se deve encerrar a sessão
const shouldEndSession = (error: AxiosError | Error): boolean => {
  // Erro 401 - Unauthorized
  if ('response' in error && error.response?.status === 401) {
    // Não fazer logout se for erro de validação de senha (ex: delete-account)
    const url = error.config?.url || ''
    // O filtro de exceção do backend devolve o erro em `userMessage` (texto,
    // ou objeto com `code` e `message`), e não na raiz: lendo só a raiz, a
    // mensagem nunca batia, e a senha errada encerrava a sessão.
    const data = error.response?.data as Record<string, unknown> | undefined
    const userMessage = data?.userMessage
    const body =
      userMessage && typeof userMessage === 'object'
        ? (userMessage as Record<string, unknown>)
        : {}
    const code = String(body.code || '')
    const message =
      (typeof userMessage === 'string' ? userMessage : body.message) ||
      data?.message ||
      ''

    // Se for um endpoint que valida senha de admin, não fazer logout
    if (
      url.includes('delete-account') ||
      url.includes('data-reset') ||
      url.includes('extend-trial') ||
      url.includes('assign-manual') ||
      PASSWORD_ERROR_CODES.includes(code) ||
      String(message).includes('Senha do administrador') ||
      // Editar cliente, Alterar status e Endereço Asaas, em Gerenciar contas,
      // respondem 401 "Senha incorreta" na API em produção; a versão nova da
      // API passa a dizer "Senha do administrador incorreta."
      String(message).includes('Senha incorreta')
    ) {
      return false
    }

    return true
  }

  // Erro de conexão - ECONNREFUSED
  if ('code' in error && error.code === 'ECONNREFUSED') {
    return true
  }

  // Erro genérico sem resposta (provavelmente conexão)
  if (!('response' in error) && 'code' in error && error.code) {
    return true
  }

  return false
}

export default async function apiInstance() {
  const session = await auth()
  const token = session?.accessToken || null
  const sessionId = session?.sessionId || null

  const devEnv = process.env.NODE_ENV === 'development'

  const api = axios.create({
    baseURL: apiUrl,
    headers: {
      common: {
        'Content-Type': 'application/json',
        Authorization: token || '',
        'x-session-id': sessionId || '',
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
    async (error) => {
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

      // Verificar se deve encerrar a sessão
      if (shouldEndSession(error)) {
        redirect('/logout')
      }

      return Promise.reject(error)
    },
  )

  return api
}
