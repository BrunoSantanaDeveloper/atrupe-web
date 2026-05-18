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
import { getAuthToken } from '@/actions/fiscal'

export function ExportXmlButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Default dates: start of current month to today
  const today = new Date()
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

  const formatDateForInput = (date: Date) => {
    return date.toISOString().split('T')[0]
  }

  const [startDate, setStartDate] = useState(formatDateForInput(startOfMonth))
  const [endDate, setEndDate] = useState(formatDateForInput(today))

  const handleExport = async () => {
    if (!startDate || !endDate) {
      toast.error('Informe o período inicial e final')
      return
    }

    if (new Date(startDate) > new Date(endDate)) {
      toast.error('A data inicial não pode ser maior que a final')
      return
    }

    try {
      setIsLoading(true)
      const token = await getAuthToken()

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/fiscal/nfe/export-xml/zip?startDate=${startDate}&endDate=${endDate}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        if (response.status === 404) {
          throw new Error('Nenhuma NF-e com XML encontrada neste período.')
        }
        throw new Error(data.message || 'Erro ao exportar XMLs')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `NFe_XMLs_${startDate}_${endDate}.zip`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success('XMLs exportados com sucesso!')
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
              Selecione o período para gerar um arquivo ZIP contendo os XMLs de
              todas as notas autorizadas.
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
