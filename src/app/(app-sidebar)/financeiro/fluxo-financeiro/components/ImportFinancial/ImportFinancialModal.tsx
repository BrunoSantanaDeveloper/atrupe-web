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
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  IconTrash,
  IconUpload,
  IconDownload,
  IconArrowRight,
  IconCloudUpload,
  IconAlertCircle,
} from '@tabler/icons-react'

import { cn } from '@/lib/utils'
import { downloadExcelCsvTemplate } from '@/lib/csv-template'
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

interface ImportError {
  row: number
  field: string
  value: string
  error: string
}

export function ImportFinancialModal() {
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
      if (
        csvFile.type === 'text/csv' ||
        csvFile.name.toLowerCase().endsWith('.csv')
      ) {
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
    // Criar um CSV de exemplo para NOVOS lançamentos financeiros
    // Usa dados de referência que JÁ EXISTEM no seed: Cliente Exemplo (012.345.678-90), Caixa Empresa, condições de pagamento (Pix, Boleto, Dinheiro)
    const csvContent = `Tipo,Descricao,Referencia,DataReferencia,ValorTotal,QuantidadeParcelas,ClienteCpfCnpj,FornecedorCpfCnpj,FuncionarioEmail,Natureza,SubCategoria,CondicaoPagamento,Parcela,DataVencimento,ValorParcela,Status,DataPagamento,ValorPago,ContaBancaria,Observacoes
RECEITA,Banner 6m2 - Cliente Exemplo,OS-00145,2024-01-15,700.00,2,012.345.678-90,,,Vendas,Prestação de Serviços,Boleto,1,2024-02-15,350.00,PAID,2024-02-14,350.00,Caixa Empresa,Pagamento via Pix
RECEITA,Banner 6m2 - Cliente Exemplo,OS-00145,2024-01-15,700.00,2,012.345.678-90,,,Vendas,Prestação de Serviços,Boleto,2,2024-03-15,350.00,PENDING,,,,Aguardando vencimento
DESPESA,Compra de lona 440g - 50m,NF-78901,2024-01-10,2500.00,1,,,,Operacional,Matéria Prima,Dinheiro,1,2024-02-10,2500.00,PAID,2024-02-09,2500.00,Caixa Empresa,Pagamento à vista
DESPESA,Frete OS-00145 - Entrega banner,FRETE-145,2024-01-20,100.00,1,,,,Operacional,Frete de Venda,Dinheiro,1,2024-01-20,100.00,PAID,2024-01-20,100.00,Caixa Empresa,Entrega realizada
RECEITA,2 Milheiros Cartão Visita,OS-00148,2024-01-18,400.00,1,012.345.678-90,,,Vendas,Venda de Mercadorias,Pix,1,2024-01-18,400.00,PAID,2024-01-18,400.00,Caixa Empresa,Pagamento no ato`

    downloadExcelCsvTemplate(
      csvContent,
      'modelo-importacao-financeiro-atrupe.csv',
    )
  }

  const handleImport = async () => {
    if (!file) return

    try {
      // Fase 1: Upload do arquivo
      setIsUploading(true)
      setUploadProgress(0)

      const formData = new FormData()
      formData.append('file', file)
      formData.append('entity', 'financial')

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
          ? `${processResult.data.successRows} lançamento(s) financeiro(s) importado(s) com sucesso!`
          : 'Nenhum lançamento foi importado'

      if (processResult.data.successRows > 0) {
        toast.success(successMsg)

        // Invalidar queries para recarregar a lista
        await queryClient.invalidateQueries({
          queryKey: ['financial-flow-list'],
        })
        await queryClient.invalidateQueries({
          queryKey: ['financial-flow-totals'],
        })

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
          <Button type="button" RightIcon={IconArrowRight} className="w-full">
            Importar
          </Button>
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
                <span>Importar planilha de lançamentos financeiros</span>
              </div>
            </DialogTitle>
            <DialogDescription className="sr-only">
              Selecione um arquivo CSV para importar receitas e despesas em lote
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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {errors.map((error, index) => (
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
                    </TableRow>
                  ))}
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
