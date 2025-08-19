'use client'

import { useEffect, useMemo, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { getItem } from '@/actions/_cruds'
import { FormSelect } from '../FormSelect'

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

  useEffect(() => {
    if (!clientId) {
      setContacts([])
      form.setValue(name, '')
      return
    }

    const fetchContacts = async () => {
      try {
        const response = await getItem({
          route: `/client/${clientId}/contacts`,
        })

        if (response.success && response.data) {
          setContacts(response.data || [])

          form.setValue(name, response.data[0].id || '')
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

  const options = useMemo(() => {
    return contacts?.map((contact) => ({
      value: contact.id,
      label: contact.name || 'Sem nome',
    }))
  }, [contacts])

  return (
    <FormSelect
      name={name}
      label={label}
      placeholder={label}
      options={options ?? []}
      width={width}
      disabled={disabled}
    />
  )
}
