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
  IconExternalLink,
} from '@tabler/icons-react'

import { cn } from '@/lib/utils'
import { downloadExcelCsvTemplate } from '@/lib/csv-template'
import {
  uploadImportFile,
  validateImport,
  processImport,
  type ImportWarning,
} from '@/actions/import'
import { ImportReviewDialog } from '@/components/common/import/ImportReviewDialog'
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
    return '/cadastros/fornecedores'
  }
  if (errorLower.includes('cnpj') && errorLower.includes('já existe')) {
    return '/cadastros/fornecedores'
  }
  if (
    errorLower.includes('categoria') &&
    errorLower.includes('não encontrada')
  ) {
    return '/configuracoes/empresa-e-sistema/categoria-de-fornecedores'
  }

  return null
}

interface ImportError {
  row: number
  field: string
  value: string
  error: string
}

export function ImportSupplierModal() {
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [errors, setErrors] = useState<ImportError[]>([])
  const [showErrors, setShowErrors] = useState(false)
  const [importId, setImportId] = useState<string | null>(null)
  const [warnings, setWarnings] = useState<ImportWarning[]>([])
  const [showReview, setShowReview] = useState(false)
  const [isConfirmingReview, setIsConfirmingReview] = useState(false)

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
    // Criar um CSV de exemplo com NOVOS fornecedores (não duplicar dados do seed)
    // Grupos já existem no seed: Suprimentos Gerais, Equipamentos e Manutenção, Serviços Terceirizados, Logística e Transporte
    const csvContent = `tipo,nome,email,telefone,celular,cpf,cnpj,rg,razaoSocial,grupo,filial,observacoes,cep,rua,numero,complemento,bairro,cidade,uf,responsavelNome,responsavelEmail,responsavelTelefone,responsavelCelular
EMPRESA,Papéis Premium Brasil,vendas@papeispremium.com.br,(11) 3333-4444,(11) 99999-8888,,12.345.678/0001-90,,Papéis Premium Indústria e Comércio Ltda,Suprimentos Gerais,NAO,Fornecedor de papéis couché e offset,04567-000,Rua das Indústrias,500,Galpão 3,Distrito Industrial,São Paulo,SP,Ricardo Mendes,ricardo@papeispremium.com.br,(11) 3333-5555,(11) 99999-7777
EMPRESA,Equipamentos Gráficos SP,comercial@equipgraficos.com.br,(11) 4444-5555,(11) 98888-7777,,23.456.789/0001-01,,Equipamentos Gráficos SP Ltda,Equipamentos e Manutenção,NAO,Manutenção de impressoras e equipamentos,05678-000,Av Industrial,1200,,Centro Industrial,Guarulhos,SP,Fernanda Lima,fernanda@equipgraficos.com.br,(11) 4444-5556,(11) 98888-7776
EMPRESA,Gráfica Terceirizada ABC,atendimento@graficaabc.com.br,(11) 5555-6666,(11) 97777-6666,,34.567.890/0001-12,,Gráfica ABC Serviços Terceirizados Ltda,Serviços Terceirizados,NAO,Impressão offset e acabamento gráfico,06789-000,Rua dos Gráficos,300,Bloco B,Parque Gráfico,Barueri,SP,Jorge Santos,jorge@graficaabc.com.br,(11) 5555-6667,(11) 97777-6665
PESSOA,Carlos Transportes,carlos.transportador@gmail.com,(11) 6666-7777,(11) 96666-5555,456.789.012-34,,45.678.901-2,,Logística e Transporte,NAO,Transportador autônomo - entregas urgentes,01234-000,Rua das Entregas,150,,Vila Carrão,São Paulo,SP,,,,`

    downloadExcelCsvTemplate(
      csvContent,
      'modelo-importacao-fornecedores-atrupe.csv',
    )
  }

  /**
   * Valida e, se estiver tudo certo, processa a importação.
   *
   * Fica separado do upload porque a validação roda de novo depois que o usuário
   * confirma a revisão. `allowReviewStep` desliga esse passo na segunda rodada,
   * para o mesmo diálogo não reaparecer em loop.
   */
  const validateAndProcess = async (
    currentImportId: string,
    allowReviewStep = true,
  ) => {
    setIsValidating(true)
    const validateResult = await validateImport(currentImportId)
    setIsValidating(false)

    if (!validateResult.success || !validateResult.data) {
      throw new Error(validateResult.error)
    }

    // Valor mal formado em campo opcional (e-mail) não barra o arquivo: mostramos
    // o que será ajustado e o usuário confirma.
    const validationWarnings = validateResult.data.warnings ?? []
    if (allowReviewStep && validationWarnings.length > 0) {
      setWarnings(validationWarnings)
      setShowReview(true)
      return
    }

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

    const processResult = await processImport(currentImportId)

    if (!processResult.success || !processResult.data) {
      throw new Error(processResult.error)
    }

    toast.success(
      `${processResult.data.successRows} fornecedor(es) importado(s) com sucesso!`,
    )

    await queryClient.invalidateQueries({ queryKey: ['suppliers'] })
    await queryClient.invalidateQueries({ queryKey: ['suppliers-totals'] })

    handleOpenChange(false)
  }

  const handleConfirmReview = async () => {
    if (!importId) return

    try {
      setIsConfirmingReview(true)
      setShowReview(false)
      setWarnings([])

      await validateAndProcess(importId, false)
    } catch (error) {
      toast.error((error as Error).message || 'Erro ao processar importação')
    } finally {
      setIsConfirmingReview(false)
      setIsValidating(false)
    }
  }

  const handleImport = async () => {
    if (!file) return

    try {
      setIsUploading(true)
      setUploadProgress(0)

      const formData = new FormData()
      formData.append('file', file)
      formData.append('entity', 'supplier')

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

      setIsUploading(false)

      await validateAndProcess(uploadedImportId)
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
      setWarnings([])
      setShowReview(false)
      setIsConfirmingReview(false)
    }
    setOpen(value)
  }

  const isProcessing = isUploading || isValidating

  return (
    <>
      <Dialog
        open={open && !showErrors && !showReview}
        onOpenChange={handleOpenChange}
      >
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
                <span>Importar planilha de fornecedores</span>
              </div>
            </DialogTitle>
            <DialogDescription className="sr-only">
              Selecione um arquivo CSV para importar fornecedores em lote
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

      <ImportReviewDialog
        open={showReview}
        onOpenChange={(value) => !value && setShowReview(false)}
        warnings={warnings}
        isConfirming={isConfirmingReview}
        onConfirm={handleConfirmReview}
      />

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
