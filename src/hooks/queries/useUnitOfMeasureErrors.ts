import { toast } from 'sonner'

// Tipos de erro específicos do sistema de unidades
export interface UnitMeasureError {
  code: string
  message: string
}

// Tipo para erro de API
export interface ApiError {
  response?: {
    status: number
    data?: {
      userMessage?: {
        message?: string
      }
      message?: string
    }
  }
  code?: string
  message?: string
}

// Hook para tratamento de erros
export function useUnitOfMeasureErrors() {
  const handleError = (error: unknown) => {
    console.error('Erro no sistema de unidades de medida:', error)

    // Tratamento de erros comuns
    if (error && typeof error === 'object' && 'code' in error) {
      const unitError = error as UnitMeasureError

      switch (unitError.code) {
        case 'UNIT_NOT_FOUND':
          toast.error(
            'Unidade de medida não encontrada. Verifique se ainda existe.',
          )
          break
        case 'INVALID_UNIT_TYPE':
          toast.error('Tipo de unidade inválido. Contate o suporte.')
          break
        case 'COMPANY_NOT_FOUND':
          toast.error('Empresa não encontrada. Faça login novamente.')
          break
        case 'UNAUTHORIZED':
          toast.error('Sessão expirada. Faça login novamente.')
          break
        case 'NETWORK_ERROR':
          toast.error(
            'Erro de conexão. Verifique sua internet e tente novamente.',
          )
          break
        default:
          toast.error(unitError.message || 'Erro inesperado. Tente novamente.')
      }
    } else {
      toast.error('Erro inesperado no sistema de unidades de medida.')
    }
  }

  const handleApiError = (error: ApiError) => {
    if (error?.response?.status === 401) {
      toast.error('Sua sessão expirou. Faça login novamente.')
      // Redirecionar para login se necessário
      window.location.href = '/login'
    } else if (error?.response?.status === 403) {
      toast.error('Você não tem permissão para realizar esta ação.')
    } else if (error?.response?.status === 404) {
      toast.error('Recurso não encontrado. Verifique se ainda existe.')
    } else if (error?.response?.status === 500) {
      toast.error('Erro interno do servidor. Tente novamente mais tarde.')
    } else if (error?.code === 'NETWORK_ERROR') {
      toast.error('Erro de conexão. Verifique sua internet.')
    } else {
      const message =
        error?.response?.data?.userMessage?.message ||
        error?.response?.data?.message ||
        error?.message ||
        'Erro inesperado'
      toast.error(message)
    }
  }

  return {
    handleError,
    handleApiError,
  }
}
