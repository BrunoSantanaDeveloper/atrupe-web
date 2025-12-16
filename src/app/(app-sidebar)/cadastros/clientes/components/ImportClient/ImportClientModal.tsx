'use client'

import { useState, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'

import { toast } from 'sonner'
import {
  Dialog,
  DialogBody,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogContent,
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

  if (errorLower.includes('cpf') && errorLower.includes('já existe')) {
    return '/cadastros/clientes'
  }
  if (errorLower.includes('cnpj') && errorLower.includes('já existe')) {
    return '/cadastros/clientes'
  }

  return null
}

interface ImportClientModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface ImportError {
  row: number
  field: string
  value: string
  error: string
}

export function ImportClientModal({
  open,
  onOpenChange,
}: ImportClientModalProps) {
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
    // Criar um CSV de exemplo
    const csvContent = `tipo,nome,email,telefone,celular,cpf,cnpj,rg,atividade,razaoSocial,observacoes,cep,rua,numero,complemento,bairro,cidade,uf
PESSOA,João Silva,joao@example.com,(11) 3333-4444,(11) 99999-8888,123.456.789-00,,12.345.678-9,,,Cliente exemplo,01310-100,Av Paulista,1000,Sala 101,Bela Vista,São Paulo,SP
EMPRESA,Empresa ABC Ltda,contato@empresaabc.com,(11) 2222-3333,(11) 98888-9999,,12.345.678/0001-90,,Comércio,Empresa ABC Comércio Ltda,Distribuidor autorizado,04567-000,Rua dos Empresários,500,,Centro,São Paulo,SP`

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)

    link.setAttribute('href', url)
    link.setAttribute('download', 'modelo-importacao-clientes.csv')
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
      formData.append('entity', 'client')

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

      // Sucesso! Importação completa
      toast.success(
        `${processResult.data.successRows} cliente(s) importado(s) com sucesso!`,
      )

      // Invalidar queries para recarregar a lista
      await queryClient.invalidateQueries({ queryKey: ['clients'] })
      await queryClient.invalidateQueries({ queryKey: ['clients-totals'] })

      // Fechar modal
      handleClose()
    } catch (error) {
      toast.error((error as Error).message || 'Erro ao processar importação')
    } finally {
      setIsUploading(false)
      setIsValidating(false)
    }
  }

  const handleClose = () => {
    setFile(null)
    setUploadProgress(0)
    setErrors([])
    setShowErrors(false)
    setImportId(null)
    setIsUploading(false)
    setIsValidating(false)
    onOpenChange(false)
  }

  const isProcessing = isUploading || isValidating

  return (
    <>
      <Dialog open={open && !showErrors} onOpenChange={handleClose}>
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
                <span>Importar planilha de clientes</span>
              </div>
            </DialogTitle>
            <DialogDescription className="sr-only">
              Selecione um arquivo CSV para importar clientes em lote
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
            <Button
              variant="neutralOutline"
              onClick={handleClose}
              disabled={isProcessing}
            >
              Fechar
            </Button>
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

export function ImportClientTriggerButton({
  onOpenChange,
}: {
  onOpenChange: (open: boolean) => void
}) {
  return (
    <ActionButton
      tooltip="Importar clientes"
      size="iconMd"
      variant="neutralOutline"
      Icon={IconUpload}
      onClick={() => onOpenChange(true)}
    />
  )
}
