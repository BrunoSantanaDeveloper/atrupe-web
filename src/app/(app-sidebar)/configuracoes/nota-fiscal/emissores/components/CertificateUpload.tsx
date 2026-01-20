'use client'

// React
import { useState, useCallback, useRef } from 'react'

// UI
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

// Icons
import { IconUpload, IconFile, IconX, IconCheck } from '@tabler/icons-react'

// Utils
import { cn } from '@/lib/utils'

interface CertificateUploadProps {
    value?: {
        certificate?: string
        certificatePassword?: string
        fileName?: string
    }
    onChange: (data: {
        certificate: string
        certificatePassword: string
        fileName: string
    }) => void
    disabled?: boolean
}

export function CertificateUpload({
    value,
    onChange,
    disabled = false,
}: CertificateUploadProps) {
    const [isDragging, setIsDragging] = useState(false)
    const [fileName, setFileName] = useState(value?.fileName || '')
    const [password, setPassword] = useState(value?.certificatePassword || '')
    const [certificate, setCertificate] = useState(value?.certificate || '')
    const inputRef = useRef<HTMLInputElement>(null)

    const handleFileChange = useCallback(
        (file: File | null) => {
            if (!file) return

            // Validar extensão
            const validExtensions = ['.pfx', '.p12']
            const extension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'))

            if (!validExtensions.includes(extension)) {
                alert('Por favor, selecione um arquivo .pfx ou .p12')
                return
            }

            // Converter para Base64
            const reader = new FileReader()
            reader.onload = () => {
                const base64 = reader.result as string
                // Remover o prefixo "data:application/x-pkcs12;base64,"
                const base64Data = base64.split(',')[1] || base64

                setCertificate(base64Data)
                setFileName(file.name)

                onChange({
                    certificate: base64Data,
                    certificatePassword: password,
                    fileName: file.name,
                })
            }
            reader.readAsDataURL(file)
        },
        [onChange, password],
    )

    const handlePasswordChange = useCallback(
        (newPassword: string) => {
            setPassword(newPassword)
            if (certificate) {
                onChange({
                    certificate,
                    certificatePassword: newPassword,
                    fileName,
                })
            }
        },
        [certificate, fileName, onChange],
    )

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault()
            setIsDragging(false)

            if (disabled) return

            const file = e.dataTransfer.files[0]
            handleFileChange(file)
        },
        [disabled, handleFileChange],
    )

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }, [])

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
    }, [])

    const handleRemove = useCallback(() => {
        setCertificate('')
        setFileName('')
        setPassword('')
        if (inputRef.current) {
            inputRef.current.value = ''
        }
        onChange({
            certificate: '',
            certificatePassword: '',
            fileName: '',
        })
    }, [onChange])

    const hasCertificate = !!certificate || !!fileName

    return (
        <div className="space-y-4">
            {/* Upload Area */}
            <div
                className={cn(
                    'relative border-2 border-dashed rounded-lg p-6 transition-colors',
                    isDragging && !disabled
                        ? 'border-brand bg-brand/5'
                        : hasCertificate
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300',
                    disabled && 'opacity-50 cursor-not-allowed',
                )}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept=".pfx,.p12"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                    disabled={disabled}
                />

                {hasCertificate ? (
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <IconFile className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">{fileName}</p>
                                <p className="text-sm text-green-600 flex items-center gap-1">
                                    <IconCheck className="w-4 h-4" />
                                    Certificado carregado
                                </p>
                            </div>
                        </div>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                handleRemove()
                            }}
                            disabled={disabled}
                        >
                            <IconX className="w-4 h-4" />
                        </Button>
                    </div>
                ) : (
                    <div className="text-center">
                        <IconUpload className="w-10 h-10 mx-auto text-gray-400" />
                        <p className="mt-2 text-sm text-gray-600">
                            Arraste o certificado digital aqui ou{' '}
                            <span className="text-brand font-medium">clique para selecionar</span>
                        </p>
                        <p className="mt-1 text-xs text-gray-400">
                            Formatos aceitos: .pfx, .p12
                        </p>
                    </div>
                )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
                <Label htmlFor="certificatePassword">Senha do Certificado</Label>
                <Input
                    id="certificatePassword"
                    type="password"
                    placeholder="Digite a senha do certificado"
                    value={password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    disabled={disabled}
                />
                <p className="text-xs text-gray-500">
                    A senha é necessária para validar o certificado digital
                </p>
            </div>
        </div>
    )
}
