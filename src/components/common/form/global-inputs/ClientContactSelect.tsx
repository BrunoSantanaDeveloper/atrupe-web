'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { getItem } from '@/actions/_cruds'
import { FormSelect } from '../FormSelect'
import { NewContactModal } from './NewContactModal'
import { Button } from '@/components/ui/button'
import { IconPlus } from '@tabler/icons-react'

interface ContactType {
  id: string
  name?: string
  email?: string
  phone?: string
  notes?: string
}

interface Props {
  name: string
  label: string
  width?: string
  clientId?: string
  disabled?: boolean
}

export function ClientContactSelect({
  name,
  label,
  width = 'w-full',
  clientId,
  disabled = false,
}: Props) {
  const form = useFormContext()
  const [contacts, setContacts] = useState<ContactType[]>([])
  const [contactModalOpen, setContactModalOpen] = useState(false)
  const pendingContactIdRef = useRef<string | null>(null)

  useEffect(() => {
    if (!clientId) {
      setContacts([])
      form.setValue(name, '', { shouldDirty: true })
      return
    }

    const fetchContacts = async () => {
      try {
        const response = await getItem({
          route: `/client/${clientId}/contacts`,
        })

        if (response.success && response.data) {
          setContacts(response.data || [])

          // Só define o primeiro contato se não houver um valor já selecionado
          const currentValue = form.getValues(name)
          if (!currentValue && response.data[0]?.id) {
            form.setValue(name, response.data[0].id, { shouldDirty: true })
          }
        } else {
          setContacts([])
        }
      } catch (err) {
        setContacts([])
        console.error('Erro ao buscar contatos:', err)
      }
    }

    fetchContacts()
  }, [clientId, form, name])

  // Set form value AFTER React re-renders with updated options
  useEffect(() => {
    if (pendingContactIdRef.current) {
      const id = pendingContactIdRef.current
      pendingContactIdRef.current = null
      form.setValue(name, id, { shouldDirty: true })
    }
  }, [contacts, form, name])

  const handleContactCreated = (newContact: { id: string; name: string }) => {
    pendingContactIdRef.current = newContact.id
    setContacts((prev) => [
      ...prev,
      { id: newContact.id, name: newContact.name },
    ])
  }

  const options = useMemo(() => {
    return contacts?.map((contact) => ({
      value: contact.id,
      label: contact.name || 'Sem nome',
    }))
  }, [contacts])

  return (
    <div className={`flex items-end gap-2 ${width}`}>
      <FormSelect
        name={name}
        label={label}
        placeholder={label}
        options={options ?? []}
        width="flex-1"
        disabled={disabled}
      />
      <Button
        type="button"
        variant="neutralOutline"
        size="iconMd"
        className="shrink-0"
        disabled={!clientId}
        onClick={() => setContactModalOpen(true)}
        title="Adicionar novo responsável"
      >
        <IconPlus size={16} />
      </Button>
      {clientId && (
        <NewContactModal
          open={contactModalOpen}
          onOpenChange={setContactModalOpen}
          clientId={clientId}
          onContactCreated={handleContactCreated}
        />
      )}
    </div>
  )
}
