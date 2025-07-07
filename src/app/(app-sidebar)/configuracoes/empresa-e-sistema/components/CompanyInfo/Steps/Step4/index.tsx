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

export function Step4() {
  return (
    <div className="grid grid-cols-1 gap-4">
      <FormInput<CompanyFormType>
        name="socialNetworks.instagram"
        label="Instagram"
        placeholder="https://instagram.com/seu_perfil"
        startAdornment={<IconBrandInstagram className="size-5" />}
      />
      <FormInput<CompanyFormType>
        name="socialNetworks.facebook"
        label="Facebook"
        placeholder="https://facebook.com/sua_pagina"
        startAdornment={<IconBrandFacebook className="size-5" />}
      />
      <FormInput<CompanyFormType>
        name="socialNetworks.linkedin"
        label="LinkedIn"
        placeholder="https://linkedin.com/in/seu_perfil"
        startAdornment={<IconBrandLinkedin className="size-5" />}
      />
    </div>
  )
}
