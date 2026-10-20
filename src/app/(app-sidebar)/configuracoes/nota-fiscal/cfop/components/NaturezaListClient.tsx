'use client'

// React
import { useState } from 'react'

// UI
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { FeaturedIcon } from '@/components/ui/featured-icon'
import { Skeleton } from '@/components/ui/skeleton'
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
import { NaturezaRow, type OperationNatureData } from './NaturezaRow'
import { NaturezaFormModal } from './NaturezaFormModal'
import { CfopData } from './CfopRow'

// Icons
import { IconCategory, IconPlus } from '@tabler/icons-react'

// Actions
import {
  createItemNew,
  deleteItemNew,
  updateItemNew,
  getData,
} from '@/actions/_cruds'

// Hooks
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'

async function fetchNatures() {
  try {
    const response = await getData({
      route: '/fiscal/naturezas',
    })
    if (Array.isArray(response)) return response
    if (response && Array.isArray(response.data)) return response.data
    return []
  } catch (error) {
    console.error('Error fetching natures:', error)
    return []
  }
}

interface NaturezaListClientProps {
  cfops: CfopData[] // Passed from parent to avoid double fetch
}

export function NaturezaListClient({ cfops }: NaturezaListClientProps) {
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedNature, setSelectedNature] =
    useState<OperationNatureData | null>(null)
  const [deleteNature, setDeleteNature] = useState<OperationNatureData | null>(
    null,
  )

  const { data: natures = [], isLoading } = useQuery({
    queryKey: ['natures'],
    queryFn: fetchNatures,
  })

  const createMutation = useMutation({
    mutationFn: async (data: unknown) => {
      return createItemNew({
        route: '/fiscal/naturezas',
        data,
      })
    },
    onSuccess: (result) => {
      if (!result.success && result.message) {
        // Check if API returns success: false
        toast.error(result.message)
        return
      }
      // Some APIs return the object directly on success, check structure if needed.
      // Assuming standard wrapper or direct object.
      toast.success('Natureza criada')
      queryClient.invalidateQueries({ queryKey: ['natures'] })
    },
    onError: (error) => {
      toast.error('Erro ao criar Natureza')
      console.error(error)
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: unknown }) => {
      return updateItemNew({
        route: `/fiscal/naturezas/${id}`,
        data,
      })
    },
    onSuccess: (result) => {
      if (!result.success) {
        toast.error(result.message || 'Erro ao atualizar Natureza')
        return
      }
      toast.success('Natureza atualizada')
      queryClient.invalidateQueries({ queryKey: ['natures'] })
    },
    onError: (error) => {
      toast.error('Erro ao atualizar Natureza')
      console.error(error)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return deleteItemNew({
        route: `/fiscal/naturezas/${id}`,
      })
    },
    onSuccess: (result) => {
      if (!result.success) {
        toast.error(result.message || 'Erro ao excluir Natureza')
        return
      }
      toast.success('Natureza excluída')
      queryClient.invalidateQueries({ queryKey: ['natures'] })
    },
    onError: (error) => {
      toast.error('Erro ao excluir Natureza')
      console.error(error)
    },
  })

  const handleEdit = (nature: OperationNatureData) => {
    console.log('[NaturezaList] handleEdit', nature)
    setSelectedNature(nature)
    setModalOpen(true)
  }

  const handleNew = () => {
    console.log('[NaturezaList] handleNew')
    setSelectedNature(null)
    setModalOpen(true)
  }

  const handleSave = async (data: Record<string, unknown>) => {
    console.log('[NaturezaList] handleSave start', data)
    try {
      if (selectedNature?.id) {
        console.log('[NaturezaList] Updating...')
        await updateMutation.mutateAsync({ id: selectedNature.id, data })
      } else {
        console.log('[NaturezaList] Creating...')
        await createMutation.mutateAsync(data)
      }
      console.log('[NaturezaList] Mutation success, closing modal')
      setModalOpen(false)

      // Small delay to allow Modal cleanup (prevent UI freeze)
      setTimeout(async () => {
        await queryClient.invalidateQueries({ queryKey: ['natures'] })
      }, 300)
    } catch (error) {
      console.error('[NaturezaList] Save error', error)
    }
  }

  const handleDelete = (nature: OperationNatureData) => {
    setDeleteNature(nature)
  }

  const confirmDelete = async () => {
    if (deleteNature) {
      await deleteMutation.mutateAsync(deleteNature.id)
      setDeleteNature(null)
    }
  }

  const handleToggleActive = async (
    nature: OperationNatureData,
    active: boolean,
  ) => {
    await updateMutation.mutateAsync({
      id: nature.id,
      data: { isActive: active },
    })
  }

  const isAnyMutating =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <FeaturedIcon tone="brand" Icon={IconCategory} />
          <div>
            <h2 className="type-section-title">Histórico de Natureza</h2>
            <p className="text-sm text-gray-500">
              Crie pré-definições para emitir suas notas fiscais com mais
              agilidade
            </p>
          </div>
        </div>
        <Button onClick={handleNew} LeftIcon={IconPlus}>
          Nova natureza
        </Button>
      </div>

      {/* List */}
      {isLoading ? (
        // Linhas no lugar da tabela, para a seção não mudar de altura
        <div className="space-y-3 rounded-xl border border-gray-200 bg-white p-4">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-10 w-full" />
          ))}
        </div>
      ) : natures.length === 0 ? (
        <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
          <FeaturedIcon
            tone="neutral"
            size="lg"
            Icon={IconCategory}
            className="mx-auto mb-4 flex"
          />
          <h3 className="type-card-title mb-2">Nenhuma Natureza cadastrada</h3>
          <p className="text-gray-500 mb-4">
            Cadastre naturezas de operação para facilitar a emissão de notas
          </p>
          <Button onClick={handleNew} LeftIcon={IconPlus}>
            Nova natureza
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left w-12"></th>
                <th className="type-eyebrow px-4 py-3 text-left">
                  Descrição da Natureza de Operação
                </th>
                <th className="type-eyebrow px-4 py-3 text-left">
                  CFOP dentro do estado
                </th>
                <th className="type-eyebrow px-4 py-3 text-left">
                  CFOP fora do estado
                </th>
                <th className="type-eyebrow px-4 py-3 text-left w-16">Ações</th>
              </tr>
            </thead>
            <tbody>
              {natures.map((nature: OperationNatureData) => (
                <NaturezaRow
                  key={nature.id}
                  nature={nature}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onToggleActive={handleToggleActive}
                  isLoading={isAnyMutating}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <NaturezaFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        nature={selectedNature}
        cfops={cfops}
        onSave={handleSave}
      />

      <AlertDialog
        open={!!deleteNature}
        onOpenChange={(open) => !open && setDeleteNature(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deseja remover Natureza?</AlertDialogTitle>
            <AlertDialogDescription>
              Eliminação da Natureza de operação{' '}
              <strong>{deleteNature?.description}</strong>
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
