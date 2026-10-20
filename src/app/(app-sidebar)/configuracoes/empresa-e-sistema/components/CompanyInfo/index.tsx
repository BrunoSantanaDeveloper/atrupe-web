'use client'

// UI component Imports
import {
  Dialog,
  DialogBody,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
  DialogContent,
  DialogDescription,
} from '@/components/ui/dialog'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

// Icon Imports
import { IconArrowRight } from '@tabler/icons-react'

// Component Imports
import { CompanySettingsList } from '@/app/(app-sidebar)/configuracoes/components/CompanySettingsList'
import { NewCompany, NewCompanyTriggerButton } from './NewCompanyInfo'
import { useMemo, useState } from 'react'
import Image from 'next/image'
import companyIcon from '@/assets/icons/companyIconPlaceholder.png'
import { useQuery } from '@tanstack/react-query'
import { getData } from '@/actions/_cruds'
import { maskCnpj } from '@/lib/utils'
import { ICompanyData } from './schema'
import { DangerActionCompanyModal } from './DangerActionCompanyModal'

export function CompanyInfo() {
  const [openDialog, setOpenDialog] = useState('')
  const [selectedCompany, setSelectedCompany] = useState<ICompanyData>()

  // Use o React Query para buscar as empresas
  const { data, isLoading } = useQuery({
    queryKey: ['companies-data'],
    queryFn: () => getData({ route: '/company', perPage: '99999' }),
  })

  const companies = useMemo(() => {
    if (!data) return []
    return data?.data
      ?.sort((a: ICompanyData, b: ICompanyData) => {
        if (a.principal !== b.principal) {
          return a.principal ? -1 : 1
        }
        return a.isActive === b.isActive ? 0 : a.isActive ? -1 : 1
      })
      ?.map((c: ICompanyData) => ({
        title: c?.general?.name,
        description: maskCnpj(c?.general?.cnpj ?? ''),
        showPrimaryElement: c?.principal,
        isInactive: !c?.isActive,
        iconImage: (
          <Image
            src={c?.personalization?.favIconUrl || companyIcon}
            alt="Logo da Empresa"
            width={86}
            height={86}
          />
        ),
        cta: c.isActive ? (
          <NewCompanyTriggerButton
            editMode
            onOpenChange={() => {
              setOpenDialog('edit-company')
              setSelectedCompany(c)
            }}
          />
        ) : (
          <Button
            type="button"
            variant="success"
            className="!opacity-100"
            onClick={() => {
              setOpenDialog('active-company')
              setSelectedCompany(c)
            }}
          >
            Ativar
          </Button>
        ),
      }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button type="button" RightIcon={IconArrowRight} className="w-full">
            Configurar
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[720px]">
          <DialogHeader>
            <div className="flex items-center gap-4">
              <DialogTitle>Configuração da empresa</DialogTitle>
            </div>
            <DialogDescription hidden></DialogDescription>
          </DialogHeader>
          <DialogBody className="max-h-[calc(100vh-200px)]">
            <CompanySettingsList settings={[{ items: companies }]} />
            {isLoading && (
              // Itens da lista de empresas ainda chegando
              <div className="space-y-2">
                {Array.from({ length: 2 }, (_, index) => (
                  <Skeleton key={index} className="h-14 w-full rounded-lg" />
                ))}
              </div>
            )}
            <div className="w-full flex justify-center mt-6">
              <NewCompanyTriggerButton
                onOpenChange={() => {
                  setOpenDialog('new-company')
                }}
              />
            </div>
          </DialogBody>
          <DialogFooter className="sm:justify-between">
            <div className="space-x-4">
              <DialogTrigger asChild>
                <Button type="button" variant="neutralOutline">
                  Voltar
                </Button>
              </DialogTrigger>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <NewCompany
        open={openDialog === 'new-company'}
        onOpenChange={() => setOpenDialog('')}
      />
      <NewCompany
        editMode
        companyData={selectedCompany}
        open={openDialog === 'edit-company'}
        onOpenChange={() => setOpenDialog('')}
      />
      <DangerActionCompanyModal
        type="active"
        open={openDialog === 'active-company'}
        companyId={selectedCompany?.id ?? ''}
        setOpen={() => setOpenDialog('')}
        title={`Deseja ativar esta empresa?`}
      />
    </>
  )
}
