/* eslint-disable  @typescript-eslint/no-explicit-any */
'use server'

import apiInstance from '@/lib/api'

interface ImportUploadResponse {
  importId: string
  status: string
  message: string
}

interface ValidateImportResponse {
  importId: string
  valid: boolean
  totalRows: number
  validRows: number
  errors: Array<{
    row: number
    field: string
    value: string
    error: string
  }>
  /** Contas bancárias citadas no CSV que a empresa ainda não tem (só importação financeira) */
  missingBankAccounts?: string[]
  preview: any[]
}

interface CreateImportBankAccountsResponse {
  created: string[]
  reactivated: string[]
  skipped: string[]
}

interface ImportStatusResponse {
  id: string
  entity: string
  status: string
  fileName: string
  totalRows: number
  successRows: number
  failedRows: number
  progress: number
  errors?: any[]
  startedAt?: string
  completedAt?: string
}

export async function uploadImportFile(formData: FormData) {
  const api = await apiInstance()

  try {
    const response = await api.post<ImportUploadResponse>(
      '/import/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    )
    return { success: true, data: response.data }
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || 'Erro ao fazer upload do arquivo',
    }
  }
}

export async function validateImport(
  importId: string,
  allowOverride: boolean = false,
) {
  const api = await apiInstance()

  try {
    const response = await api.post<ValidateImportResponse>(
      `/import/${importId}/validate?allowOverride=${allowOverride}`,
    )
    return { success: true, data: response.data }
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || 'Erro ao validar importação',
    }
  }
}

/**
 * Cria as contas bancárias que o CSV cita e a empresa não tem. Os nomes vêm do
 * arquivo já enviado, então basta o importId.
 */
export async function createImportBankAccounts(importId: string) {
  const api = await apiInstance()

  try {
    const response = await api.post<CreateImportBankAccountsResponse>(
      `/import/${importId}/bank-accounts`,
    )
    return { success: true, data: response.data }
  } catch (error: any) {
    return {
      success: false,
      error:
        error.response?.data?.message || 'Erro ao criar as contas bancárias',
    }
  }
}

interface ProcessImportResponse {
  importId: string
  successRows: number
  failedRows: number
  errors: any[]
}

export async function processImport(importId: string) {
  const api = await apiInstance()

  try {
    const response = await api.post<ProcessImportResponse>(
      `/import/${importId}/process`,
    )
    return { success: true, data: response.data }
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || 'Erro ao processar importação',
    }
  }
}

export async function getImportStatus(importId: string) {
  const api = await apiInstance()

  try {
    const response = await api.get<ImportStatusResponse>(
      `/import/${importId}/status`,
    )
    return { success: true, data: response.data }
  } catch (error: any) {
    return {
      success: false,
      error:
        error.response?.data?.message || 'Erro ao buscar status da importação',
    }
  }
}

export async function listImports(page = 1, limit = 20) {
  const api = await apiInstance()

  try {
    const response = await api.get('/import/list', {
      params: { page, limit },
    })
    return { success: true, data: response.data }
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || 'Erro ao listar importações',
    }
  }
}

export async function downloadImportTemplate() {
  try {
    // Criar um CSV de exemplo
    const csvContent = `type,name,email,phone,mobile,cpf,cnpj,rg,activity,corporateName,notes,cep,rua,numero,complemento,bairro,cidade,uf
PERSON,João Silva,joao@example.com,(11) 3333-4444,(11) 99999-8888,123.456.789-00,,12.345.678-9,,,Cliente exemplo,01310-100,Av Paulista,1000,Sala 101,Bela Vista,São Paulo,SP
COMPANY,Empresa ABC Ltda,contato@empresaabc.com,(11) 2222-3333,(11) 98888-9999,,12.345.678/0001-90,,Comércio,Empresa ABC Comércio Ltda,Distribuidor autorizado,04567-000,Rua dos Empresários,500,,Centro,São Paulo,SP`

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)

    link.setAttribute('href', url)
    link.setAttribute('download', 'modelo-importacao-clientes-atrupe.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: 'Erro ao baixar template',
    }
  }
}
