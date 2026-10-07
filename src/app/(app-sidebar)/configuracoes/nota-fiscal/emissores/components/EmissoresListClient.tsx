'use client'

// React
import { useState } from 'react'

// UI
import { toast } from 'sonner'
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
import { EmissorData, EmissorListItem } from './EmissorListItem'
import { EmissorFormModal, type EmissorFormValues } from './EmissorFormModal'
import { ActivationWizardModal } from './ActivationWizardModal'
import type { FiscalEnv } from '../lib/fiscal-readiness'

// Icons
import { IconBuilding, IconLoader2 } from '@tabler/icons-react'

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

async function fetchEmissores(): Promise<EmissorData[]> {
  try {
    const response = await getData({
      route: '/fiscal/emissores',
    })
    if (!response.success) {
      console.error('Error fetching emissores:', response.message)
      return []
    }
    if (Array.isArray(response.data)) return response.data as EmissorData[]
    if (response.data?.data && Array.isArray(response.data.data))
      return response.data.data as EmissorData[]
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
  const [modalInitialTab, setModalInitialTab] = useState<
    'certificado' | undefined
  >(undefined)
  const [deleteEmissor, setDeleteEmissor] = useState<EmissorData | null>(null)
  const [wizardOpen, setWizardOpen] = useState(false)
  const [wizardEmissor, setWizardEmissor] = useState<EmissorData | null>(null)
  const [wizardEnv, setWizardEnv] = useState<FiscalEnv>('PRODUCAO')
  const [wizardDocType, setWizardDocType] = useState<'NFE' | 'NFSE' | 'NFCE'>(
    'NFCE',
  )

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
      const config = emissores.find(
        (e: EmissorData) => e.companyId === company.id,
      )

      // Cria um objeto EmissorData híbrido.
      //
      // Parte do `config` INTEIRO devolvido pela API e só sobrescreve o que a
      // tela deriva da empresa. Antes era uma cópia campo a campo, e todo campo
      // novo do emissor (NCM padrão, aba Reforma, prazo da NFC-e, "emissor
      // ativo") ficava fora dela: o modal abria vazio e, como ele envia o
      // formulário inteiro, o "Salvar" seguinte apagava no banco o que o
      // usuário tinha configurado. Era a quarta allowlist do emissor, além de
      // mapDtoToDb/mapDbToResponse no backend e form.reset no modal.
      const emissorData: EmissorData = {
        ...config,
        id: config?.id || '', // ID vazio indica que não existe config
        companyId: company.id,
        // O nome próprio do emissor é o que o usuário gravou; o nome fantasia
        // só entra enquanto o emissor não existe ou está sem nome.
        name: config?.name || company.general.name,
        isDefault: config?.isDefault || false,
        environment: config?.environment, // Se undefined, será tratado como não configurado

        // Estado por ambiente (Plano 2/4)
        activeEnvironment: config?.activeEnvironment ?? null,
        activeEnvironmentNfe: config?.activeEnvironmentNfe ?? null,
        activeEnvironmentNfse: config?.activeEnvironmentNfse ?? null,
        activeEnvironmentNfce: config?.activeEnvironmentNfce ?? null,
        environmentSwitchLocked: config?.environmentSwitchLocked ?? null,
        environments: config?.environments,

        // Dados da empresa vindo da API ou fallback para dados da empresa
        company: {
          id: company.id,
          name: company.general.name,
          legalName: company.general.legalName,
          cnpj: company.general.cnpj,
          stateRegistration: company.general.stateRegistration || undefined,
          municipalRegistration:
            company.general.municipalRegistration || undefined,
          providerConfigured: config?.company?.providerConfigured ?? false,
          partnerKey: config?.company?.partnerKey || undefined,

          address: {
            street: company.address?.street || undefined,
            number: company.address?.number || undefined,
            neighborhood: company.address?.neighborhood || undefined,
            zipcode: company.address?.zipcode || undefined,
            city: company.address?.city || undefined,
            state: company.address?.state || undefined,
            country: '1058',
          },
          hasCertificate: config?.company?.hasCertificate, // Do backend service refactor
        },

        // Configuração Fiscal
        emitCrt: config?.emitCrt || '1',
        ibgeCode: config?.ibgeCode || '', // Refactored property from backend service
      }
      return emissorData
    }) || []

  // As actions de CRUD resolvem `{ success: false }` em vez de rejeitar. Sem
  // lançar aqui, `mutateAsync` resolvia, o modal fechava e o usuário achava
  // que tinha salvo — inclusive quando o backend recusava o payload.
  const createMutation = useMutation({
    mutationFn: async (data: EmissorFormValues) => {
      const result = await createItemNew({
        route: '/fiscal/emissores',
        data,
      })
      if (!result.success) {
        throw new Error(result.message || 'Erro ao criar emissor')
      }
      return result
    },
    onSuccess: () => {
      toast.success('Emissor configurado')
      queryClient.invalidateQueries({ queryKey: ['emissores'] })
      queryClient.invalidateQueries({ queryKey: ['fiscal-onboarding-status'] })
      setModalOpen(false)
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Erro ao criar emissor',
      )
      console.error(error)
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string
      data: Partial<EmissorFormValues>
    }) => {
      const result = await updateItemNew({
        route: `/fiscal/emissores/${id}`,
        data,
      })
      if (!result.success) {
        throw new Error(result.message || 'Erro ao atualizar emissor')
      }
      return result
    },
    onSuccess: () => {
      toast.success('Emissor atualizado')
      queryClient.invalidateQueries({ queryKey: ['emissores'] })
      queryClient.invalidateQueries({ queryKey: ['fiscal-onboarding-status'] })
      setModalOpen(false)
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Erro ao atualizar emissor',
      )
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
      toast.success('Configuração removida')
      queryClient.invalidateQueries({ queryKey: ['emissores'] })
      queryClient.invalidateQueries({ queryKey: ['fiscal-onboarding-status'] })
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
      toast.success('Definido como padrão')
      queryClient.invalidateQueries({ queryKey: ['emissores'] })
      queryClient.invalidateQueries({ queryKey: ['fiscal-onboarding-status'] })
    },
    onError: (_error) => toast.error('Erro ao definir padrão'),
  })

  const testConnectionMutation = useMutation({
    mutationFn: async ({
      id,
      environment,
    }: {
      id: string
      environment: FiscalEnv
    }) => {
      return createItemNew({
        route: `/fiscal/emissores/${id}/environments/${environment}/test-connection`,
        data: {},
      })
    },
    onSuccess: (result) => {
      if (result.success && result.data?.success) {
        toast.success('Autenticação validada')
      } else {
        toast.error(result.message || 'Falha na autenticação.')
      }
    },
    onError: (_error) => toast.error('Erro ao testar autenticação'),
  })

  const handleEdit = (emissor: EmissorData, type: EditType = 'GLOBAL') => {
    setSelectedEmissor(emissor)
    setEditType(type)
    setModalInitialTab(undefined)
    setModalOpen(true)
  }

  // Saída da pendência de certificado no wizard de ativação: abre o emissor
  // já na aba do certificado, em vez de deixar o usuário procurar.
  const handleCadastrarCertificado = (emissor: EmissorData) => {
    setSelectedEmissor(emissor)
    setEditType('GLOBAL')
    setModalInitialTab('certificado')
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

  const handleSave = async (data: EmissorFormValues) => {
    if (selectedEmissor?.id) {
      await updateMutation.mutateAsync({
        id: selectedEmissor.id,
        data,
      })
    } else {
      await createMutation.mutateAsync(data)
    }
  }

  // (Wrappers para mutations passadas pro componente)
  const handleSetDefault = (e: EmissorData) => {
    if (!e.id) return Promise.resolve()
    return setDefaultMutation.mutateAsync(e.id)
  }
  const handleTestConnection = (e: EmissorData) => {
    if (!e.id) {
      toast.warning('Configure o emissor antes de testar autenticação.')
      return Promise.resolve()
    }
    return testConnectionMutation.mutateAsync({
      id: e.id,
      environment: (e.activeEnvironment ?? 'HOMOLOGACAO') as FiscalEnv,
    })
  }

  const handleActivate = (
    e: EmissorData,
    environment: FiscalEnv,
    docType: 'NFE' | 'NFSE' | 'NFCE',
  ) => {
    if (!e.id) {
      handleEdit(e, 'GLOBAL')
      return
    }
    setWizardEmissor(e)
    setWizardEnv(environment)
    setWizardDocType(docType)
    setWizardOpen(true)
  }

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
          {/* O título já está no cabeçalho da página; aqui só o contexto. */}
          <p className="type-secondary">
            Gerencie as configurações fiscais por empresa/filial
          </p>
        </div>
        {/* Botão Novo Emissor removido pois a lista é baseada em empresas cadastradas */}
      </div>

      {combinedEmissores.length === 0 ? (
        <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
          <IconBuilding className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="type-card-title mb-2">Nenhuma empresa encontrada</h3>
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
              onSetDefault={handleSetDefault}
              onTestConnection={handleTestConnection}
              onActivate={handleActivate}
              onRefresh={() =>
                queryClient.invalidateQueries({ queryKey: ['emissores'] })
              }
            />
          ))}
        </div>
      )}

      <EmissorFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        emissor={selectedEmissor}
        editType={editType}
        initialTab={modalInitialTab}
        onSave={handleSave}
      />

      <ActivationWizardModal
        open={wizardOpen}
        onOpenChange={setWizardOpen}
        emissor={wizardEmissor}
        environment={wizardEnv}
        docType={wizardDocType}
        onCadastrarCertificado={
          wizardEmissor
            ? () => handleCadastrarCertificado(wizardEmissor)
            : undefined
        }
      />

      <AlertDialog
        open={!!deleteEmissor}
        onOpenChange={(open) => !open && setDeleteEmissor(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover configuração</AlertDialogTitle>
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
              Remover configuração
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
