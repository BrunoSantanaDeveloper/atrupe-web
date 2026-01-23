'use client'

// React
import { useState } from 'react'

// UI
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { FeaturedIcon } from '@/components/ui/featured-icon'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

// Components
import { EmissorListItem } from './EmissorListItem'
import { type EmissorData } from './EmissorRow' // Keeping type
import { EmissorFormModal } from './EmissorFormModal'

// Icons
import { IconBuilding, IconPlus, IconLoader2 } from '@tabler/icons-react'

// Actions
import {
  createItemNew,
  deleteItemNew,
  updateItemNew,
  getData,
} from '@/actions/_cruds'

// Hooks
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'

// Types
import { ICompanyData } from '@/app/(app-sidebar)/configuracoes/empresa-e-sistema/components/CompanyInfo/schema'

export type EditType = 'GLOBAL' | 'NFE' | 'NFSE' | 'NFCE'

async function fetchEmissores() {
  try {
    const response = await getData({
      route: '/fiscal/emissores',
    })
    if (!response.success) {
      console.error('Error fetching emissores:', response.message)
      return []
    }
    if (Array.isArray(response.data)) return response.data
    if (response.data?.data && Array.isArray(response.data.data))
      return response.data.data
    return []
  } catch (error) {
    console.error('Error fetching emissores:', error)
    return []
  }
}

export function EmissoresListClient() {
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedEmissor, setSelectedEmissor] = useState<EmissorData | null>(
    null,
  )
  const [editType, setEditType] = useState<EditType>('GLOBAL')
  const [deleteEmissor, setDeleteEmissor] = useState<EmissorData | null>(null)
  const [targetCompany, setTargetCompany] = useState<ICompanyData | null>(null)

  // 1. Buscar Empresas
  const { data: companiesResponse, isLoading: isLoadingCompanies } = useQuery({
    queryKey: ['companies'],
    queryFn: () => getData({ route: '/company', perPage: '999' }),
  })

  // 2. Buscar Configurações Existentes
  const { data: emissores = [], isLoading: isLoadingEmissores } = useQuery({
    queryKey: ['emissores'],
    queryFn: fetchEmissores,
  })

  const isLoading = isLoadingCompanies || isLoadingEmissores

  // 3. Combinar Dados
  const combinedEmissores =
    companiesResponse?.data?.map((company: ICompanyData) => {
      // Tenta encontrar uma configuração para esta empresa
      // Assumindo que o backend retorna companyId no config ou que podemos cruzar de alguma forma
      // Como o backend atual filtra por req.user.companyId, pode ser que só retorne 1 config.
      // Se o usuário tem acesso a múltiplas empresas, o backend deveria retornar todas.
      // AVISO: Se o backend filtrar, apenas a empresa logada aparecerá "Configurada".
      const config = emissores.find((e: any) => e.companyId === company.id)

      // Cria um objeto EmissorData híbrido
      const emissorData: EmissorData = {
        id: config?.id || '', // ID vazio indica que não existe config
        companyId: company.id,
        name: company.general.name,
        isDefault: config?.isDefault || false,
        // Prioriza dados da config, fallback para dados da empresa
        emitRazaoSocial: config?.emitRazaoSocial || company.general.legalName,
        emitNomeFantasia: config?.emitNomeFantasia || company.general.name,
        emitCnpj: config?.emitCnpj || company.general.cnpj,
        emitEndereco: config?.emitEndereco || company.address?.street || '',
        emitNumero: config?.emitNumero || company.address?.number || '',
        emitBairro: config?.emitBairro || company.address?.neighborhood || '',
        emitCep: config?.emitCep || company.address?.zipcode || '',
        emitCmun: config?.emitCmun || '',
        emitUf: config?.emitUf || company.address?.state || '',
        emitIe: config?.emitIe || company.general.stateRegistration || '',
        emitIm: config?.emitIm || company.general.municipalRegistration || '',
        emitCrt: config?.emitCrt || '1',
        environment: config?.environment, // Se undefined, será tratado como não configurado
        hasCertificate: config?.hasCertificate || false,
        accessKey: config?.accessKey,
        // Fiscal Configs
        serieNfe: config?.serieNfe,
        proximoNumeroNfe: config?.proximoNumeroNfe,
        serieNfse: config?.serieNfse,
        proximoRpsNfse: config?.proximoRpsNfse,
        codigoServico: config?.codigoServico,
        aliquotaIss: config?.aliquotaIss,
        serieNfce: config?.serieNfce,
        proximoNumeroNfce: config?.proximoNumeroNfce,
        defaultCfop: config?.defaultCfop,
        defaultOperationNature: config?.defaultOperationNature,
      }
      return emissorData
    }) || []

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return createItemNew({
        route: '/fiscal/emissores',
        data,
      })
    },
    onSuccess: (result) => {
      if (!result.success) {
        toast.error(result.message || 'Erro ao criar emissor')
        return
      }
      toast.success('Emissor configurado com sucesso!')
      queryClient.invalidateQueries({ queryKey: ['emissores'] })
      setModalOpen(false)
    },
    onError: (error) => {
      toast.error('Erro ao criar emissor')
      console.error(error)
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return updateItemNew({
        route: `/fiscal/emissores/${id}`,
        data,
      })
    },
    onSuccess: (result) => {
      if (!result.success) {
        toast.error(result.message || 'Erro ao atualizar emissor')
        return
      }
      toast.success('Emissor atualizado com sucesso!')
      queryClient.invalidateQueries({ queryKey: ['emissores'] })
      setModalOpen(false)
    },
    onError: (error) => {
      toast.error('Erro ao atualizar emissor')
      console.error(error)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return deleteItemNew({
        route: `/fiscal/emissores/${id}`,
      })
    },
    onSuccess: (result) => {
      if (!result.success) {
        toast.error(result.message || 'Erro ao excluir emissor')
        return
      }
      toast.success('Configuração removida com sucesso!')
      queryClient.invalidateQueries({ queryKey: ['emissores'] })
      setDeleteEmissor(null)
    },
    onError: (error) => {
      toast.error('Erro ao excluir emissor')
      console.error(error)
    },
  })

  // ... (Outras mutations: setDefault, testConnection - mantidas iguais)
  const setDefaultMutation = useMutation({
    mutationFn: async (id: string) => {
      return createItemNew({
        route: `/fiscal/emissores/${id}/set-default`,
        data: {},
      })
    },
    onSuccess: (result) => {
      if (!result.success) {
        toast.error(result.message || 'Erro ao definir padrão')
        return
      }
      toast.success('Definido como padrão!')
      queryClient.invalidateQueries({ queryKey: ['emissores'] })
    },
    onError: (error) => toast.error('Erro ao definir padrão'),
  })

  const testConnectionMutation = useMutation({
    mutationFn: async (id: string) => {
      return createItemNew({
        route: `/fiscal/emissores/${id}/test-connection`,
        data: {},
      })
    },
    onSuccess: (result) => {
      if (result.data?.success) toast.success('Conexão OK!')
      else toast.error('Falha na conexão.')
    },
    onError: (error) => toast.error('Erro ao testar conexão'),
  })

  const handleEdit = (emissor: EmissorData, type: EditType = 'GLOBAL') => {
    setSelectedEmissor(emissor)
    setEditType(type)
    setModalOpen(true)
  }

  const handleDelete = (emissor: EmissorData) => {
    setDeleteEmissor(emissor)
  }

  const confirmDelete = async () => {
    if (deleteEmissor?.id) {
      await deleteMutation.mutateAsync(deleteEmissor.id)
    }
  }

  const handleSave = async (data: any) => {
    if (selectedEmissor?.id) {
      // Remove companyId from data if present to avoid validation error
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { companyId, ...updateData } = data
      await updateMutation.mutateAsync({
        id: selectedEmissor.id,
        data: updateData,
      })
    } else {
      // Backend pega companyId do token, não enviar no payload
      await createMutation.mutateAsync(data)
    }
  }

  // (Wrappers para mutations passadas pro componente)
  const handleSetDefault = (e: EmissorData) =>
    setDefaultMutation.mutateAsync(e.id)
  const handleTestConnection = (e: EmissorData) =>
    testConnectionMutation.mutateAsync(e.id)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <IconLoader2 className="w-6 h-6 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-500">Carregando empresas...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <FeaturedIcon variant="outline" Icon={IconBuilding} />
          <div>
            <h2 className="text-lg font-semibold">Emissores de Nota Fiscal</h2>
            <p className="text-sm text-gray-500">
              Gerencie as configurações fiscais por empresa/filial
            </p>
          </div>
        </div>
        {/* Botão Novo Emissor removido pois a lista é baseada em empresas cadastradas */}
      </div>

      {combinedEmissores.length === 0 ? (
        <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
          <IconBuilding className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            Nenhuma empresa encontrada
          </h3>
          <p className="text-gray-500 mb-4">
            Cadastre uma empresa no menu Configurações &gt; Empresa e Sistema
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {combinedEmissores.map((emissor: EmissorData) => (
            <EmissorListItem
              key={emissor.companyId} // Use companyId as key
              emissor={emissor}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <EmissorFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        emissor={selectedEmissor}
        editType={editType}
        onSave={handleSave}
      />

      <AlertDialog
        open={!!deleteEmissor}
        onOpenChange={(open) => !open && setDeleteEmissor(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover Configuração</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover as configurações fiscais de{' '}
              <strong>{deleteEmissor?.name}</strong>? A emissão de notas será
              interrompida.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Remover Configuração
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
