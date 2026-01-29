'use client'

// React
import { useState } from 'react'

// UI
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { FeaturedIcon } from '@/components/ui/featured-icon'
import { Separator } from '@/components/ui/separator'
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
import { CfopRow, type CfopData } from './CfopRow'
import { CfopFormModal } from './CfopFormModal'
import { NaturezaListClient } from './NaturezaListClient'

// Icons
import { IconArrowsSplit, IconPlus, IconLoader2 } from '@tabler/icons-react'

// Actions
import {
  createItemNew,
  deleteItemNew,
  updateItemNew,
  getData,
} from '@/actions/_cruds'

// Hooks
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'

async function fetchCfops() {
  try {
    const response = await getData({
      route: '/fiscal/cfops',
    })
    if (Array.isArray(response)) return response
    if (response && Array.isArray(response.data)) return response.data
    return []
  } catch (error) {
    console.error('Error fetching cfops:', error)
    return []
  }
}

// Renamed internally but exported as CfopListClient to match file name and usage
export function CfopListClient() {
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedCfop, setSelectedCfop] = useState<CfopData | null>(null)
  const [deleteCfop, setDeleteCfop] = useState<CfopData | null>(null)

  const { data: cfops = [], isLoading } = useQuery({
    queryKey: ['cfops'],
    queryFn: fetchCfops,
  })

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return createItemNew({
        route: '/fiscal/cfops',
        data,
      })
    },
    onSuccess: (result) => {
      if (!result.success) {
        toast.error(result.message || 'Erro ao criar CFOP')
        return
      }
      toast.success('CFOP criado com sucesso!')
      queryClient.invalidateQueries({ queryKey: ['cfops'] })
    },
    onError: (error) => {
      toast.error('Erro ao criar CFOP')
      console.error(error)
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return updateItemNew({
        route: `/fiscal/cfops/${id}`,
        data,
      })
    },
    onSuccess: (result) => {
      if (!result.success) {
        toast.error(result.message || 'Erro ao atualizar CFOP')
        return
      }
      toast.success('CFOP atualizado com sucesso!')
      queryClient.invalidateQueries({ queryKey: ['cfops'] })
    },
    onError: (error) => {
      toast.error('Erro ao atualizar CFOP')
      console.error(error)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return deleteItemNew({
        route: `/fiscal/cfops/${id}`,
      })
    },
    onSuccess: (result) => {
      if (!result.success) {
        toast.error(result.message || 'Erro ao excluir CFOP')
        return
      }
      toast.success('CFOP excluído com sucesso!')
      queryClient.invalidateQueries({ queryKey: ['cfops'] })
    },
    onError: (error) => {
      toast.error('Erro ao excluir CFOP')
      console.error(error)
    },
  })

  const handleEdit = (cfop: CfopData) => {
    console.log('[CfopList] handleEdit', cfop)
    setSelectedCfop(cfop)
    setModalOpen(true)
  }

  const handleNewCfop = () => {
    console.log('[CfopList] handleNewCfop')
    setSelectedCfop(null)
    setModalOpen(true)
  }

  const handleSave = async (data: any) => {
    console.log('[CfopList] handleSave start', data)
    try {
      if (selectedCfop?.id) {
        console.log('[CfopList] Updating...')
        await updateMutation.mutateAsync({ id: selectedCfop.id, data })
      } else {
        console.log('[CfopList] Creating...')
        await createMutation.mutateAsync(data)
      }
      console.log('[CfopList] Mutation success, closing modal')
      setModalOpen(false)

      // Small delay to allow Modal cleanup (prevent UI freeze)
      setTimeout(async () => {
        await queryClient.invalidateQueries({ queryKey: ['cfops'] })
      }, 300)
    } catch (error) {
      console.error('[CfopList] Save error', error)
    }
  }

  const handleDelete = (cfop: CfopData) => {
    setDeleteCfop(cfop)
  }

  const confirmDelete = async () => {
    if (deleteCfop) {
      await deleteMutation.mutateAsync(deleteCfop.id)
      setDeleteCfop(null)
    }
  }

  const isAnyMutating =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending

  return (
    <div className="space-y-12">
      {/* CFOP Section - Deve vir primeiro para cadastrar antes das Naturezas */}
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <FeaturedIcon variant="outline" Icon={IconArrowsSplit} />
            <div>
              <h2 className="text-lg font-semibold">Tabela de CFOP</h2>
              <p className="text-sm text-gray-500">
                Gerencie os CFOPs utilizados na emissão de notas fiscais
              </p>
            </div>
          </div>
          <Button onClick={handleNewCfop} LeftIcon={IconPlus}>
            Novo CFOP
          </Button>
        </div>

        {/* CFOP List */}
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <IconLoader2 className="w-6 h-6 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-500">Carregando dados...</span>
          </div>
        ) : cfops.length === 0 ? (
          <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
            <IconArrowsSplit className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              Nenhum CFOP cadastrado
            </h3>
            <p className="text-gray-500 mb-4">
              Adicione CFOPs customizados para usar nas suas notas fiscais
            </p>
            <Button onClick={handleNewCfop} LeftIcon={IconPlus}>
              Adicionar CFOP
            </Button>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left w-12">
                    {/* Status indicator space or similar if needed */}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Código
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Descrição
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Informações de uso
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-16">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {cfops.map((cfop: CfopData) => (
                  <CfopRow
                    key={cfop.id}
                    cfop={cfop}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    isLoading={isAnyMutating}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Separator />

      {/* Natureza Section - Vem depois, pois depende dos CFOPs cadastrados */}
      <NaturezaListClient cfops={cfops} />

      {/* Models */}
      <CfopFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        cfop={selectedCfop}
        onSave={handleSave}
      />

      <AlertDialog
        open={!!deleteCfop}
        onOpenChange={(open) => !open && setDeleteCfop(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deseja remover CFOP?</AlertDialogTitle>
            <AlertDialogDescription>
              Eliminação do CFOP <strong>{deleteCfop?.code}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
