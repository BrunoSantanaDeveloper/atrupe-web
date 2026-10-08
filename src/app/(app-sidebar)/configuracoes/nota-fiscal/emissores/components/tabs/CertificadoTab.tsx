'use client'

import { useCallback, useEffect, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  IconCloudUpload,
  IconFileCertificate,
  IconCircleCheckFilled,
  IconTrash,
  IconAlertTriangle,
} from '@tabler/icons-react'
import { Icon } from '@/components/ui/icon'

import { updateItemNew } from '@/actions/_cruds'
import { cn } from '@/lib/utils'

const certTypeOptions = [
  { value: 'A1', label: 'A1 (arquivo .pfx)' },
  { value: 'A3', label: 'A3 (token/smartcard)' },
]

interface Props {
  emissorId?: string
  /** Valor inicial vindo de emissor.company.hasCertificate */
  initialHasCertificate?: boolean
}

/**
 * Upload e substituição do certificado digital.
 *
 * Estado local (arquivo, senha, tipo) fica aqui e não no formulário do
 * emissor: o certificado tem endpoint próprio
 * (PATCH /fiscal/emissores/:id/certificate) e é salvo separadamente do
 * restante da configuração.
 */
export function CertificadoTab({ emissorId, initialHasCertificate }: Props) {
  const [certBase64, setCertBase64] = useState<string | null>(null)
  const [certFileName, setCertFileName] = useState<string | null>(null)
  const [certPassword, setCertPassword] = useState('')
  const [certType, setCertType] = useState<'A1' | 'A3'>('A1')
  const [isUploading, setIsUploading] = useState(false)
  const [hasCertificate, setHasCertificate] = useState(!!initialHasCertificate)

  useEffect(() => {
    setHasCertificate(!!initialHasCertificate)
    setCertBase64(null)
    setCertFileName(null)
    setCertPassword('')
    setCertType('A1')
  }, [initialHasCertificate, emissorId])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0]
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1]
        setCertBase64(base64)
        setCertFileName(file.name)
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/x-pkcs12': ['.pfx', '.p12'] },
    multiple: false,
  })

  const handleRemove = () => {
    setCertBase64(null)
    setCertFileName(null)
    setCertPassword('')
  }

  const handleUpload = async () => {
    if (!certBase64 || !certPassword || !emissorId) return
    setIsUploading(true)
    try {
      const result = await updateItemNew({
        route: `/fiscal/emissores/${emissorId}/certificate`,
        data: {
          certificate: certBase64,
          certificatePassword: certPassword,
          certificateType: certType,
        },
      })
      if (!result.success) {
        toast.error(result.message || 'Erro ao atualizar certificado')
        return
      }
      toast.success('Certificado atualizado')
      handleRemove()
      setHasCertificate(true)
    } catch {
      toast.error('Erro ao atualizar certificado')
    } finally {
      setIsUploading(false)
    }
  }

  if (!emissorId) {
    return (
      <p className="text-sm text-muted-foreground">
        Salve o emissor primeiro para enviar o certificado digital.
      </p>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-gray-100">
        <h3 className="type-card-title">Certificado Digital</h3>
        {hasCertificate && !certBase64 && (
          <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
            <Icon icon={IconCircleCheckFilled} size="sm" />
            Certificado ativo
          </span>
        )}
      </div>

      {/*
        O certificado é 1 por empresa (DigitalCertificate.companyId é @unique),
        não 1 por emissor. Dizer isso na UI evita prometer um isolamento que o
        modelo de dados não entrega.
      */}
      <div className="flex gap-2 rounded-md border border-amber-200 bg-amber-50 p-3">
        <Icon
          icon={IconAlertTriangle}
          size="sm"
          className="text-amber-600 shrink-0 mt-0.5"
        />
        <p className="text-xs text-amber-900">
          O certificado é único por empresa e compartilhado por todos os
          emissores. Substituí-lo aqui afeta a emissão de todos eles.
        </p>
      </div>

      {certBase64 ? (
        <div className="space-y-4">
          <div className="p-3 border rounded-lg flex items-center justify-between border-neutral-200 bg-white">
            <div className="flex items-center gap-3">
              <Icon
                icon={IconFileCertificate}
                size="lg"
                className="text-neutral-400 shrink-0"
              />
              <p className="text-sm font-medium text-neutral-800 truncate">
                {certFileName}
              </p>
            </div>
            <Button
              type="button"
              variant="neutralGhost"
              size="icon"
              onClick={handleRemove}
            >
              <Icon icon={IconTrash} size="md" className="text-neutral-500" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                Tipo de Certificado
              </label>
              <select
                value={certType}
                onChange={(e) => setCertType(e.target.value as 'A1' | 'A3')}
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
              >
                {certTypeOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                Senha do Certificado *
              </label>
              <input
                type="password"
                value={certPassword}
                onChange={(e) => setCertPassword(e.target.value)}
                placeholder="Digite a senha do certificado"
                autoComplete="new-password"
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
              />
            </div>
          </div>

          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={handleUpload}
            isLoading={isUploading}
            disabled={!certPassword || isUploading}
            className="w-full"
          >
            Salvar Certificado
          </Button>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={cn(
            'border border-dashed rounded-lg px-6 py-5 text-center cursor-pointer transition-colors',
            isDragActive
              ? 'border-brand-400 bg-brand-50'
              : 'border-gray-300 hover:border-brand-300 bg-white',
          )}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-2">
            <Icon icon={IconCloudUpload} size="lg" className="text-gray-400" />
            <p className="text-sm text-gray-500">
              <span className="text-brand-600 font-semibold">
                {hasCertificate
                  ? 'Clique para substituir o certificado'
                  : 'Clique para selecionar o arquivo .pfx ou .p12'}
              </span>
              {' ou arraste aqui'}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
