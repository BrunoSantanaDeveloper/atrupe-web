'use client'

// React
import { useState } from 'react'

// UI
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

// Actions
import { downloadResetBackup, fetchCompanyResets } from '@/actions/accountReset'

// Libs
import { formatToLocaleDate, formatToLocaleDateTime } from '@/lib/formatDate'

// Third-party
import { useQuery } from '@tanstack/react-query'

// Icons
import { IconDownload } from '@tabler/icons-react'

/** Salva no computador a cópia que veio em base64. */
function saveFile(base64: string, filename: string) {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)

  const url = URL.createObjectURL(
    new Blob([bytes], { type: 'application/gzip' }),
  )
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  // Revogar na hora pode cancelar o download em alguns navegadores.
  setTimeout(() => URL.revokeObjectURL(url), 60000)
}

/**
 * Os "zerar dados" já feitos na conta: quando, por quem, quanto saiu e a cópia
 * do que saiu, enquanto ela estiver guardada. Só aparece se houver algum.
 */
export function DataResets({ companyId }: { companyId: string }) {
  const [downloading, setDownloading] = useState<string | null>(null)

  const { data } = useQuery({
    queryKey: ['account-reset', 'list', companyId],
    queryFn: () => fetchCompanyResets(companyId),
  })
  const resets = data?.success ? (data.data ?? []) : []

  if (!resets.length) return null

  const handleDownload = async (resetId: string) => {
    setDownloading(resetId)
    try {
      const res = await downloadResetBackup(resetId)
      if (!res.success || !res.data) {
        toast.error(res.message)
        return
      }
      saveFile(res.data.base64, res.data.filename)
    } finally {
      setDownloading(null)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-gray-700">Dados zerados</CardTitle>
        <p className="text-sm text-gray-600">
          Cada vez que os dados da conta foram zerados. A cópia do que saiu é um
          JSON compactado, guardado por 30 dias, para consulta ou recuperação
          pelo time técnico.
        </p>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>Data</TableHead>
              <TableHead>Feito por</TableHead>
              <TableHead>Registros apagados</TableHead>
              <TableHead>Opções</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {resets.map((item) => {
              const total = item.summary.reduce((sum, s) => sum + s.count, 0)
              return (
                <TableRow key={item.id}>
                  <TableCell className="whitespace-nowrap">
                    {formatToLocaleDateTime(item.createdAt)}
                  </TableCell>
                  <TableCell>{item.createdByName}</TableCell>
                  <TableCell>{total.toLocaleString('pt-BR')}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {item.options.includeFiscalDocuments ? (
                        <Badge variant="neutralLight" className="text-xs">
                          Notas fiscais
                        </Badge>
                      ) : null}
                      {item.options.restoreDefaults ? (
                        <Badge variant="neutralLight" className="text-xs">
                          Configurações de conta nova
                        </Badge>
                      ) : null}
                      {!item.options.includeFiscalDocuments &&
                      !item.options.restoreDefaults
                        ? '-'
                        : null}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {item.backupAvailable ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="neutralOutline"
                        RightIcon={IconDownload}
                        isLoading={downloading === item.id}
                        onClick={() => handleDownload(item.id)}
                      >
                        Cópia até {formatToLocaleDate(item.backupExpiresAt!)}
                      </Button>
                    ) : (
                      <span className="text-sm text-gray-500">
                        Cópia descartada
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
