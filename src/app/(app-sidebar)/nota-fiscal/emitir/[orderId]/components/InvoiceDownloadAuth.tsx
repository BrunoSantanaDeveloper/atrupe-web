'use client'

import { useState } from 'react'

// UI
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Accordion,
  AccordionItem,
  AccordionContent,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { FeaturedIcon } from '@/components/ui/featured-icon'
import { cn } from '@/lib/utils'

// Icons
import {
  IconCloudDownload,
  IconPlus,
  IconTrash,
  IconId,
} from '@tabler/icons-react'

// Types
import type { NfePrepareResponse } from '@/types/fiscal/nfe-prepare'

interface Props {
  data: NfePrepareResponse
  onUpdate: (data: NfePrepareResponse) => void
}

export function InvoiceDownloadAuth({ data, onUpdate }: Props) {
  const [newDoc, setNewDoc] = useState('')

  const addDoc = () => {
    // Basic validation (simple check, full validation on backend or more in-depth regex)
    const cleanDoc = newDoc.replace(/\D/g, '')
    if (cleanDoc.length !== 11 && cleanDoc.length !== 14) return

    onUpdate({
      ...data,
      autXml: [...(data.autXml || []), cleanDoc],
    })

    setNewDoc('')
  }

  const removeDoc = (index: number) => {
    const newAutXml = [...(data.autXml || [])]
    newAutXml.splice(index, 1)
    onUpdate({
      ...data,
      autXml: newAutXml,
    })
  }

  const formatDoc = (doc: string) => {
    const clean = doc.replace(/\D/g, '')
    if (clean.length === 11) {
      return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
    }
    if (clean.length === 14) {
      return clean.replace(
        /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
        '$1.$2.$3/$4-$5',
      )
    }
    return doc
  }

  return (
    <Card className="border-none shadow-sm overflow-hidden">
      <Accordion type="single" collapsible>
        <AccordionItem value="auth" className="p-0 m-0 border-0">
          <CardHeader className="flex flex-row items-center justify-between py-4 bg-white border-b border-gray-100">
            <div className="flex gap-3 items-center">
              <FeaturedIcon variant="neutralOutline" Icon={IconCloudDownload} />
              <CardTitle className="text-gray-700 font-semibold text-base">
                Autorização de download (autXML)
              </CardTitle>
            </div>
            <AccordionTrigger
              className={cn(
                buttonVariants({
                  variant: 'neutralLight',
                  size: 'icon',
                }),
                'mr-0 [&>svg]:text-gray [&>svg]:size-5',
              )}
            />
          </CardHeader>
          <AccordionContent>
            <CardContent className="p-6 space-y-4">
              <p className="text-sm text-gray-500">
                Informe o CNPJ ou CPF das pessoas autorizadas a fazer o download
                do XML da NF-e.
              </p>

              <div className="flex gap-2">
                <Input
                  value={newDoc}
                  onChange={(e) => setNewDoc(e.target.value)}
                  placeholder="000.000.000-00 ou 00.000.000/0000-00"
                  maxLength={18}
                />
                <Button
                  variant="neutralOutline"
                  LeftIcon={IconPlus}
                  onClick={addDoc}
                  disabled={
                    !newDoc ||
                    (newDoc.replace(/\D/g, '').length !== 11 &&
                      newDoc.replace(/\D/g, '').length !== 14)
                  }
                >
                  Adicionar
                </Button>
              </div>

              <div className="space-y-2 pt-2">
                {(!data.autXml || data.autXml.length === 0) && (
                  <div className="text-sm text-gray-400 italic">
                    Nenhum autorizado cadastrado.
                  </div>
                )}

                {data.autXml?.map((doc, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 border rounded-lg bg-white"
                  >
                    <div className="flex items-center gap-3">
                      <IconId className="text-gray-400" size={20} />
                      <span className="font-medium text-gray-700">
                        {formatDoc(doc)}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="iconSm"
                      className="text-gray-400 hover:text-error-600"
                      onClick={() => removeDoc(idx)}
                      aria-label="Remover autorização"
                    >
                      <IconTrash size={16} />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  )
}
