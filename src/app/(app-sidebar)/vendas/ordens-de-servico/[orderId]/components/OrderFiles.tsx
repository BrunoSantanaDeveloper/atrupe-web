'use client'

// Os arquivos da O.S. (GP-49, 22/11/2026): a O.S. geral guarda arquivos de
// vários formatos (imagem, PDF da impressão, projeto da serralheria), com a
// intenção maior de armazenar. Vê quem vê a O.S.; acrescenta e apaga quem
// edita. Contam no espaço dos arquivos e entram na limpeza da O.S.
// concluída ou finalizada. Os arquivos de cada etapa ficam nos
// gerenciadores, com o acesso do gerenciador.

// React
import { useCallback, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

// UI
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

// Components
import { InfoHint } from '@/components/common/InfoHint'
import { PermissionGate } from '@/components/common/PermissionGate'

// Utils
import {
  formatBytes,
  deleteOrderFile,
  fetchOrderFiles,
  uploadOrderFile,
  type OrderFile,
  type ProductionStorage,
} from '@/lib/production-upload'

// Third-party
import { toast } from 'sonner'

// Icons
import { IconPaperclip, IconTrash } from '@tabler/icons-react'

const when = (value: string) =>
  new Date(value).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

export function OrderFiles({
  orderId,
  canceled,
}: {
  orderId: string
  canceled?: boolean
}) {
  const { data: session } = useSession()
  const token = session?.accessToken
  const [files, setFiles] = useState<OrderFile[]>([])
  const [storage, setStorage] = useState<ProductionStorage | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [chosen, setChosen] = useState<File[]>([])
  const [sending, setSending] = useState<string | null>(null)
  const [inputKey, setInputKey] = useState(0)

  const load = useCallback(async () => {
    const res = await fetchOrderFiles(token, orderId)
    if (res) {
      setFiles(res.files)
      setStorage(res.storage)
    }
    setLoaded(true)
  }, [token, orderId])

  useEffect(() => {
    if (token) load()
  }, [token, load])

  const send = async () => {
    for (let index = 0; index < chosen.length; index++) {
      const file = chosen[index]
      setSending(`${index + 1} de ${chosen.length}`)
      const res = await uploadOrderFile({ token, orderId, file, storage })
      if (!res.success) {
        toast.error(res.message)
        break
      }
    }
    setSending(null)
    setChosen([])
    setInputKey((value) => value + 1)
    await load()
  }

  const remove = async (file: OrderFile) => {
    const res = await deleteOrderFile(token, orderId, file.id)
    if (!res.success) return toast.error(res.message)
    toast.success(res.message)
    await load()
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-1.5">
          <CardTitle>Arquivos da O.S.</CardTitle>
          <InfoHint title="Arquivos da O.S.">
            <p>
              Para guardar os arquivos do trabalho: imagens, o PDF da impressão,
              o projeto. Vê quem vê esta O.S.
            </p>
            <p>
              Os arquivos de cada etapa ficam no gerenciador, para quem tem
              acesso a ele.
            </p>
          </InfoHint>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!canceled && (
          <PermissionGate permissions={['sale:order:edit']}>
            <div className="flex flex-wrap items-end gap-3">
              <Input
                key={inputKey}
                type="file"
                multiple
                aria-label="Escolher arquivos"
                className="max-w-sm"
                onChange={(event) =>
                  setChosen(Array.from(event.target.files || []))
                }
              />
              <Button
                type="button"
                variant="neutralOutline"
                LeftIcon={IconPaperclip}
                disabled={!chosen.length || !!sending}
                onClick={send}
              >
                {sending ? `Enviando ${sending}` : 'Acrescentar'}
              </Button>
              {storage && (
                <span className="text-xs text-gray">
                  Até {formatBytes(storage.maxFileBytes)} por arquivo ·{' '}
                  {formatBytes(storage.usedBytes)}
                  {storage.quotaBytes
                    ? ` de ${formatBytes(storage.quotaBytes)}`
                    : ''}{' '}
                  usados
                </span>
              )}
            </div>
          </PermissionGate>
        )}

        {loaded && !files.length && (
          <p className="text-sm text-gray">Nenhum arquivo nesta O.S.</p>
        )}

        {!!files.length && (
          <ul className="divide-y divide-gray-100 rounded-lg border border-gray-200">
            {files.map((file) => (
              <li
                key={file.id}
                className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2 text-sm"
              >
                {file.removedAt ? (
                  <span className="text-gray line-through">
                    {file.fileName}
                  </span>
                ) : file.url ? (
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-brand-700 hover:underline"
                  >
                    {file.fileName}
                  </a>
                ) : (
                  <span className="font-medium">{file.fileName}</span>
                )}
                <span className="text-xs text-gray">
                  {formatBytes(file.size)} · {file.uploadedBy},{' '}
                  {when(file.uploadedAt)}
                </span>
                {file.removedAt && (
                  <span className="text-xs text-warning-700">
                    removido na limpeza de {when(file.removedAt)}
                  </span>
                )}
                <PermissionGate permissions={['sale:order:edit']}>
                  <button
                    type="button"
                    className="ml-auto text-gray hover:text-error-700"
                    onClick={() => remove(file)}
                  >
                    <Icon icon={IconTrash} size="sm" label="Apagar arquivo" />
                  </button>
                </PermissionGate>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
