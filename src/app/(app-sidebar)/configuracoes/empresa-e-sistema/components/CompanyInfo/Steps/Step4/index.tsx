'use client'

// Component Imports
import { FormInput } from '@/components/common/form/FormInput'
import { CompanyFormType } from '../../schema'

// Icons
import {
  IconBrandInstagram,
  IconBrandFacebook,
  IconBrandLinkedin,
} from '@tabler/icons-react'
import { Icon } from '@/components/ui/icon'

export function Step4() {
  return (
    <div className="grid grid-cols-1 gap-4">
      <FormInput<CompanyFormType>
        name="socialNetworks.instagram"
        label="Instagram"
        placeholder="seu_perfil"
        startAdornment={<Icon icon={IconBrandInstagram} size="md" />}
      />
      <FormInput<CompanyFormType>
        name="socialNetworks.facebook"
        label="Facebook"
        placeholder="sua_pagina"
        startAdornment={<Icon icon={IconBrandFacebook} size="md" />}
      />
      <FormInput<CompanyFormType>
        name="socialNetworks.linkedin"
        label="LinkedIn"
        placeholder="seu_perfil"
        startAdornment={<Icon icon={IconBrandLinkedin} size="md" />}
      />
    </div>
  )
}
