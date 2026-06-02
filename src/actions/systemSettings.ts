'use server'

import apiInstance from '@/lib/api'

export interface SystemSettingsData {
  environment: 'sandbox' | 'production'
  sandbox: { url: string; token: string }
  production: { url: string; token: string }
}

export interface UpdateSystemSettingsPayload {
  config: SystemSettingsData
  password?: string
}

export interface AiAccessSettingsData {
  enabled: boolean
}

export async function updateSystemSettings(
  payload: UpdateSystemSettingsPayload,
) {
  const api = await apiInstance()

  try {
    const res = await api.put('/system-settings/asaas', payload)
    return {
      success: true,
      message: 'Configurações atualizadas com sucesso!',
      data: res.data,
    }
  } catch (error: unknown) {
    const err = error as {
      response?: {
        status?: number
        data?: {
          message?: string
          userMessage?: {
            message?: string
            statusCode?: number
          }
        }
      }
    }
    const userMessage = err?.response?.data?.userMessage
    const message =
      userMessage?.message ||
      err?.response?.data?.message ||
      'Erro ao salvar configurações.'

    return {
      success: false,
      code: userMessage?.statusCode || err?.response?.status || 500,
      message,
    }
  }
}

export async function updateAiAccessSettings(payload: AiAccessSettingsData) {
  const api = await apiInstance()

  try {
    const res = await api.put('/system-settings/ai-access', payload)
    return {
      success: true,
      message: 'Acesso ao Assistente IA atualizado com sucesso!',
      data: res.data as AiAccessSettingsData,
    }
  } catch (error: unknown) {
    const err = error as {
      response?: {
        status?: number
        data?: {
          message?: string
          userMessage?: {
            message?: string
            statusCode?: number
          }
        }
      }
    }
    const userMessage = err?.response?.data?.userMessage
    return {
      success: false,
      code: userMessage?.statusCode || err?.response?.status || 500,
      message:
        userMessage?.message ||
        err?.response?.data?.message ||
        'Erro ao atualizar o acesso ao Assistente IA.',
    }
  }
}
