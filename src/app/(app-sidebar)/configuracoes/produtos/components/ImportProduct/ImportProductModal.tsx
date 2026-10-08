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
import { Switch } from '@/components/ui/switch'
import {
  IconTrash,
  IconUpload,
  IconDownload,
  IconArrowRight,
  IconCloudUpload,
  IconAlertCircle,
  IconExternalLink,
} from '@tabler/icons-react'
import { ICON_SIZE } from '@/components/ui/icon'

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

// Mapeamento de erros para URLs de correção
const getErrorFixUrl = (field: string, error: string): string | null => {
  const errorLower = error.toLowerCase()

  if (errorLower.includes('código') && errorLower.includes('já existe')) {
    return '/configuracoes/produtos'
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

  return null
}

interface ImportError {
  row: number
  field: string
  value: string
  error: string
}

export function ImportProductModal() {
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [errors, setErrors] = useState<ImportError[]>([])
  const [showErrors, setShowErrors] = useState(false)
  const [allowOverride, setAllowOverride] = useState(false)
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
    setAllowOverride(false)
  }

  const handleDownloadTemplate = () => {
    // Criar um CSV de exemplo com NOVOS produtos (não duplicar códigos do seed)
    // Setores já existem no seed: Impressão, Gráfica Rápida, CNC, Serralheria
    // Grupos já existem no seed: Lonas, Adesivos, Revenda Gráfica Rápida, Estruturas, PVC
    const csvContent = `codigo,nome,descricao,setor,grupo,unidadeMedida,largura,altura,duracao,valorUnitario,permitirEdicao\nBANER2,Banner Lona 280g,Banner em lona econômica 280g com acabamento simples,Impressão,Lonas,M2,1.00,1.00,,40.00,SIM\nCARTV2,Cartão Visita Premium,Cartão laminação fosca,Gráfica Rápida,Revenda Gráfica Rápida,UN,0.09,0.05,,150.00,SIM\nADFOS2,Adesivo Perfurado Veicular,Adesivo perfurado para aplicação em vidros,Impressão,Adesivos,M2,1.00,1.00,,80.00,SIM\nPNACM2,Painel ACM Luminoso,Painel em ACM com caixa de luz LED,Serralheria,Estruturas,M2,1.00,1.00,,350.00,SIM\nLONA2,Lona Blackout,Lona blackout para projeção traseira,Impressão,Lonas,M2,1.00,1.00,,60.00,SIM\nLTP30,Letra Caixa PVC 30mm,Letra caixa em PVC expandido 30mm com LED,CNC,PVC,M2,1.00,1.00,,200.00,SIM`

    downloadExcelCsvTemplate(
      csvContent,
      'modelo-importacao-produtos-atrupe.csv',
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
      formData.append('entity', 'product')

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

      const validateResult = await validateImport(
        uploadedImportId,
        allowOverride,
      )

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
          ? `${processResult.data.successRows} produto(s) importado(s) com sucesso!`
          : 'Nenhum produto foi importado'

      if (processResult.data.successRows > 0) {
        toast.success(successMsg)

        // Invalidar queries para recarregar a lista
        await queryClient.invalidateQueries({ queryKey: ['product-list'] })
        await queryClient.invalidateQueries({ queryKey: ['product-totals'] })
        await queryClient.invalidateQueries({
          queryKey: ['product-group-list'],
        })
        await queryClient.invalidateQueries({ queryKey: ['category-list'] })

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
      setAllowOverride(false)
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
                <span>Importar planilha de produtos</span>
              </div>
            </DialogTitle>
            <DialogDescription className="sr-only">
              Selecione um arquivo CSV para importar produtos em lote
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
                      <IconTrash size={ICON_SIZE.md} />
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

              {file && (
                <div className="flex items-center gap-2 pt-2 border-t mt-4">
                  <Switch
                    id="allowOverride"
                    checked={allowOverride}
                    onCheckedChange={setAllowOverride}
                  />
                  <label
                    htmlFor="allowOverride"
                    className="text-sm cursor-pointer select-none text-gray-700 font-medium"
                  >
                    Sobrescrever produtos com mesmo código (Atualizar
                    existentes)
                  </label>
                </div>
              )}
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
                <IconAlertCircle size={ICON_SIZE.sm} />
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
                              <IconExternalLink
                                size={ICON_SIZE.sm}
                                className="mr-1"
                              />
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
