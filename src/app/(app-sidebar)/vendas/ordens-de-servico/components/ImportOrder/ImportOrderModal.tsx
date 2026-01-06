'use client'

import { useState, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'

import { toast } from 'sonner'
import {
  Dialog,
  DialogBody,
  DialogTitle,
  DialogClose,
  DialogFooter,
  DialogHeader,
  DialogContent,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { FeaturedIcon } from '@/components/ui/featured-icon'
import { ActionButton } from '@/components/common/ActionButton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  IconTrash,
  IconUpload,
  IconDownload,
  IconArrowRight,
  IconCloudUpload,
  IconAlertCircle,
  IconExternalLink,
} from '@tabler/icons-react'

import { cn } from '@/lib/utils'
import {
  uploadImportFile,
  validateImport,
  processImport,
} from '@/actions/import'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

// Mapeamento de erros para URLs de correção
const getErrorFixUrl = (field: string, error: string): string | null => {
  const errorLower = error.toLowerCase()

  if (
    errorLower.includes('cliente') ||
    field.toLowerCase().includes('cliente')
  ) {
    return '/cadastros/clientes'
  }
  if (
    errorLower.includes('produto') ||
    field.toLowerCase().includes('produto')
  ) {
    return '/configuracoes/produtos'
  }
  if (
    errorLower.includes('vendedor') ||
    field.toLowerCase().includes('vendedor')
  ) {
    return '/configuracoes/vendas/perfil-de-vendedor'
  }
  if (errorLower.includes('série') || field.toLowerCase().includes('serie')) {
    return '/configuracoes/vendas/series-de-venda'
  }
  if (
    errorLower.includes('categoria') ||
    field.toLowerCase().includes('categoria')
  ) {
    return '/configuracoes/produtos/grupo-de-produtos'
  }
  if (errorLower.includes('setor') || field.toLowerCase().includes('setor')) {
    return '/configuracoes/empresa-e-sistema/setores'
  }
  if (
    errorLower.includes('condição de pagamento') ||
    field.toLowerCase().includes('pagamento')
  ) {
    return '/configuracoes/financeiro/configuracoes-de-pagamento/condicoes-de-pagamento'
  }
  if (
    errorLower.includes('fornecedor') ||
    errorLower.includes('transportador') ||
    errorLower.includes('comissionado')
  ) {
    return '/cadastros/fornecedores'
  }

  return null
}

interface ImportError {
  row: number
  field: string
  value: string
  error: string
}

export function ImportOrderModal() {
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [errors, setErrors] = useState<ImportError[]>([])
  const [showErrors, setShowErrors] = useState(false)
  const [_importId, setImportId] = useState<string | null>(null)

  const queryClient = useQueryClient()

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const csvFile = acceptedFiles[0]
      if (csvFile.type === 'text/csv' || csvFile.name.endsWith('.csv')) {
        setFile(csvFile)
        setErrors([])
        setImportId(null)
      } else {
        toast.error('Por favor, selecione apenas arquivos CSV')
      }
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
    },
    multiple: false,
  })

  const handleRemoveFile = () => {
    setFile(null)
    setUploadProgress(0)
    setErrors([])
    setImportId(null)
  }

  const handleDownloadTemplate = () => {
    // Criar um CSV de exemplo baseado no schema do backend
    // Campos financeiros são opcionais e devem ser informados apenas na primeira linha de cada ordem
    const csvContent = `NumeroVenda,Serie,StatusOrdem,DataVenda,DataValidade,DataEntrega,ClienteCpfCnpj,ClienteNome,VendedorEmail,ResponsavelNome,ResponsavelEmail,ItemID,ProdutoCodigo,ProdutoNome,Quantidade,ValorUnitario,ValorTotal,Desconto,ObservacaoItem,CondicaoPagamento,QtdParcelas,Parcela1Valor,Parcela1Vencimento,Parcela2Valor,Parcela2Vencimento,Parcela3Valor,Parcela3Vencimento,EntradaValor,EntradaVencimento,TipoEntrega,FreteCusto,FreteValor,FreteFornecedorCpfCnpj,ComissaoValor,ComissaoFornecedorCpfCnpj,ComissaoRepasse
1,V1,IN_PRODUCTION,2024-01-15,2024-02-15,2024-02-20,12345678900,João Silva,vendedor@empresa.com,Maria Santos,maria@empresa.com,1,PROD-001,Porta de Madeira,2,350.00,700.00,0,Entrega em 15 dias,Boleto,2,575.00,2024-02-15,575.00,2024-03-15,,,,,CARRIER,150.00,200.00,12345678000190,100.00,98765432100,SINGLE
1,V1,IN_PRODUCTION,2024-01-15,2024-02-15,2024-02-20,12345678900,João Silva,vendedor@empresa.com,,,2,PROD-002,Janela de Alumínio,1,450.00,450.00,0,,,,,,,,,,,,,,,,,,
2,V1,FINISHED,2024-01-16,,,98765432100,Maria Santos,vendedor@empresa.com,,,1,PROD-003,Portão Automático,1,1800.00,1800.00,0,Instalação incluída,Boleto,1,1800.00,2024-02-16,,,,,,,PICKUP,,,,,,,`

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)

    link.setAttribute('href', url)
    link.setAttribute('download', 'modelo-importacao-ordens-atrupe.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleImport = async () => {
    if (!file) return

    try {
      // Fase 1: Upload do arquivo
      setIsUploading(true)
      setUploadProgress(0)

      const formData = new FormData()
      formData.append('file', file)
      formData.append('entity', 'order')

      // Simular progresso durante o upload
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      const uploadResult = await uploadImportFile(formData)

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (!uploadResult.success || !uploadResult.data) {
        throw new Error(uploadResult.error)
      }

      const uploadedImportId = uploadResult.data.importId
      setImportId(uploadedImportId)

      // Fase 2: Validação
      setIsUploading(false)
      setIsValidating(true)

      const validateResult = await validateImport(uploadedImportId)

      setIsValidating(false)

      if (!validateResult.success || !validateResult.data) {
        throw new Error(validateResult.error)
      }

      // Se houver erros de validação, mostrar modal de erros
      if (validateResult.data.errors && validateResult.data.errors.length > 0) {
        const formattedErrors = validateResult.data.errors.map((err) => ({
          row: err.row,
          field: err.field,
          value: err.value,
          error: err.error,
        }))
        setErrors(formattedErrors)
        setShowErrors(true)
        return
      }

      // Fase 3: Processar importação
      const processResult = await processImport(uploadedImportId)

      if (!processResult.success || !processResult.data) {
        throw new Error(processResult.error)
      }

      // Se houver erros durante o processamento, mostrar
      if (processResult.data.errors && processResult.data.errors.length > 0) {
        const formattedErrors = processResult.data.errors.map((err) => ({
          row: err.row,
          field: 'Processamento',
          value: '',
          error: err.error,
        }))
        setErrors(formattedErrors)
        setShowErrors(true)
        return
      }

      // Sucesso! Importação completa
      const successMsg =
        processResult.data.successRows > 0
          ? `${processResult.data.successRows} ordem(ns) de serviço importada(s) com sucesso!`
          : 'Nenhuma ordem de serviço foi importada'

      if (processResult.data.successRows > 0) {
        toast.success(successMsg)

        // Invalidar queries para recarregar a lista
        await queryClient.invalidateQueries({ queryKey: ['order-list'] })
        await queryClient.invalidateQueries({ queryKey: ['order-totals'] })

        // Fechar modal
        handleOpenChange(false)
      } else {
        toast.warning(successMsg)
      }
    } catch (error) {
      toast.error((error as Error).message || 'Erro ao processar importação')
    } finally {
      setIsUploading(false)
      setIsValidating(false)
    }
  }

  const handleOpenChange = (value: boolean) => {
    if (!value) {
      setFile(null)
      setUploadProgress(0)
      setErrors([])
      setShowErrors(false)
      setImportId(null)
      setIsUploading(false)
      setIsValidating(false)
    }
    setOpen(value)
  }

  const isProcessing = isUploading || isValidating

  return (
    <>
      <Dialog open={open && !showErrors} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button RightIcon={IconArrowRight}>Importar</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[578px]">
          <DialogHeader>
            <DialogTitle>
              <div className="flex flex-col items-center gap-4 text-center">
                <FeaturedIcon
                  variant="successBorderedLight"
                  Icon={IconUpload}
                  size="lg"
                  rounded
                />
                <span>Importar planilha de ordens de serviço</span>
              </div>
            </DialogTitle>
            <DialogDescription className="sr-only">
              Selecione um arquivo CSV para importar ordens de serviço em lote
            </DialogDescription>
          </DialogHeader>

          <DialogBody>
            <div className="space-y-5">
              {!file ? (
                <div
                  {...getRootProps()}
                  className={cn(
                    'border border-dashed border-brand-300 hover:border-brand-200 rounded-lg px-6 py-4 text-center cursor-pointer transition-colors',
                    isDragActive ? 'bg-brand-50' : 'bg-white',
                  )}
                >
                  <input {...getInputProps()} />
                  <div className="flex flex-col items-center gap-2">
                    <FeaturedIcon
                      variant="neutralBorderedLight"
                      Icon={IconCloudUpload}
                      size="default"
                      rounded
                    />
                    <p className="text-sm ">
                      <span className="text-brand-700 font-semibold">
                        Clique para selecionar o arquivo .CSV
                      </span>
                      <span className="text-gray">
                        {' '}
                        ou arraste e solte o arquivo aqui
                      </span>
                    </p>
                  </div>
                </div>
              ) : (
                <div className="border rounded-lg p-4 bg-white">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-medium text-gray-900">{file.name}</p>
                      <p className="text-sm text-gray-500">
                        {(file.size / 1024).toFixed(0)} KB
                      </p>
                    </div>
                    <Button
                      variant="neutralGhost"
                      size="icon"
                      onClick={handleRemoveFile}
                      disabled={isProcessing}
                    >
                      <IconTrash className="w-5 h-5" />
                    </Button>
                  </div>
                  {isProcessing && (
                    <div className="space-y-2">
                      <Progress value={uploadProgress} className="h-2" />
                      <p className="text-sm text-gray-500 text-right">
                        {isUploading && `Enviando... ${uploadProgress}%`}
                        {isValidating && 'Validando dados...'}
                      </p>
                    </div>
                  )}
                </div>
              )}

              <Button
                variant="neutralOutline"
                className="w-full"
                onClick={handleDownloadTemplate}
                disabled={isProcessing}
                LeftIcon={IconDownload}
              >
                Baixar planilha modelo
              </Button>
            </div>
          </DialogBody>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="neutralOutline" disabled={isProcessing}>
                Fechar
              </Button>
            </DialogClose>
            <Button
              onClick={handleImport}
              disabled={!file}
              isLoading={isProcessing}
              RightIcon={IconArrowRight}
            >
              Importar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Error Dialog */}
      <Dialog open={showErrors} onOpenChange={() => setShowErrors(false)}>
        <DialogContent className="sm:max-w-[940px]">
          <DialogHeader>
            <div className="flex items-center gap-4">
              <FeaturedIcon variant="neutralOutline" Icon={IconAlertCircle} />
              <DialogTitle>Erros de importação</DialogTitle>
              <DialogDescription className="sr-only">
                Verifique se as informações foram inseridas corretamente na
                planilha e tente novamente.
              </DialogDescription>
            </div>
          </DialogHeader>

          <DialogBody>
            {errors.length > 0 && (
              <Alert variant="error" className="mb-4 hidden">
                <IconAlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Foram encontrados {errors.length} erro(s) na planilha
                </AlertDescription>
              </Alert>
            )}

            <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
              <Table>
                <TableHeader className="bg-gray-25">
                  <TableRow>
                    <TableHead>Linha</TableHead>
                    <TableHead>Coluna</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Motivo</TableHead>
                    <TableHead className="w-24">Corrigir</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {errors.map((error, index) => {
                    const fixUrl = getErrorFixUrl(error.field, error.error)
                    return (
                      <TableRow key={index}>
                        <TableCell>{error.row}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2 py-1 rounded-md bg-red-50 text-red-700 text-xs font-medium">
                            {error.field}
                          </span>
                        </TableCell>
                        <TableCell className="text-nowrap">
                          {error.value || (
                            <span className="text-gray-400">vazio</span>
                          )}
                        </TableCell>
                        <TableCell>{error.error}</TableCell>
                        <TableCell>
                          {fixUrl && (
                            <Button
                              variant="neutralGhost"
                              size="sm"
                              onClick={() => window.open(fixUrl, '_blank')}
                            >
                              <IconExternalLink className="w-4 h-4 mr-1" />
                              Abrir
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </DialogBody>

          <DialogFooter>
            <Button
              variant="neutralOutline"
              onClick={() => setShowErrors(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={() => {
                setShowErrors(false)
                handleRemoveFile()
              }}
              RightIcon={IconArrowRight}
            >
              Tentar novamente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export function ImportOrderTriggerButton({
  onOpenChange,
}: {
  onOpenChange: (open: boolean) => void
}) {
  return (
    <ActionButton
      tooltip="Importar ordens de serviço"
      size="iconMd"
      variant="neutralOutline"
      Icon={IconUpload}
      onClick={() => onOpenChange(true)}
    />
  )
}
