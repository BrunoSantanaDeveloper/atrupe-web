'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogBody,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { IconFileZip, IconDownload } from '@tabler/icons-react'
import { extractApiErrorMessage } from '@/lib/api-error-message'

/**
 * AAAA-MM-DD no horário local. `toISOString()` é UTC: depois das 21h no
 * Brasil o "hoje" virava amanhã e o período padrão nascia errado.
 */
function dataLocal(date: Date) {
  const ano = date.getFullYear()
  const mes = String(date.getMonth() + 1).padStart(2, '0')
  const dia = String(date.getDate()).padStart(2, '0')
  return `${ano}-${mes}-${dia}`
}

export function ExportXmlButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Período padrão: do início do mês até hoje.
  const today = new Date()
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

  const [startDate, setStartDate] = useState(dataLocal(startOfMonth))
  const [endDate, setEndDate] = useState(dataLocal(today))

  const handleExport = async () => {
    if (!startDate || !endDate) {
      toast.error('Informe o período inicial e final')
      return
    }

    if (startDate > endDate) {
      toast.error('A data inicial não pode ser maior que a final')
      return
    }

    try {
      setIsLoading(true)

      // Rota do próprio Next, que fala com a API pelo servidor. Antes a
      // chamada ia direto para `NEXT_PUBLIC_API_URL`, variável que não existe
      // neste projeto: virava `undefined`, caía no 404 do Next e nunca
      // chegava ao backend.
      const parametros = new URLSearchParams({ startDate, endDate })
      const response = await fetch(
        `/api/fiscal/nfe/export-xml?${parametros.toString()}`,
      )

      if (!response.ok) {
        // A mensagem do backend distingue "nenhuma nota no período" de
        // "notas sem XML"; o texto fixo de antes escondia essa diferença.
        const data = await response.json().catch(() => null)
        throw new Error(
          data
            ? extractApiErrorMessage(data)
            : 'Não foi possível exportar os XMLs.',
        )
      }

      const total = Number(response.headers.get('X-Nfe-Total') ?? 0)
      const faltantes = Number(response.headers.get('X-Nfe-Missing-Xml') ?? 0)

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `NFe_XMLs_${startDate}_${endDate}.zip`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      if (faltantes > 0) {
        toast.warning(
          `ZIP gerado com ${total - faltantes} de ${total} XMLs. ` +
            `${faltantes} nota(s) sem XML no provedor — veja FALTANTES.txt no arquivo.`,
        )
      } else {
        toast.success('XMLs exportados')
      }
      setIsOpen(false)
    } catch (err: unknown) {
      const error = err as Error
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Button
        variant="neutralOutline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="gap-2"
      >
        <IconFileZip className="h-4 w-4 text-gray-500" />
        <span className="hidden sm:inline">Exportar XMLs (ZIP)</span>
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Exportar XMLs de NF-e</DialogTitle>
            <DialogDescription>
              Gera um ZIP com os XMLs das NF-e (modelo 55) autorizadas no
              período, incluindo as cartas de correção. NFS-e e NFC-e não
              entram.
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Data Inicial</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">Data Final</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button
              variant="neutralOutline"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleExport}
              disabled={isLoading}
              className="gap-2"
            >
              <IconDownload className="h-4 w-4" />
              {isLoading ? 'Exportando...' : 'Exportar ZIP'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
