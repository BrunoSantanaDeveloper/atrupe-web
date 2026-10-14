'use client'

// Editar o item da O.S. aprovada (decisão do PO de 14/10/2026, questão 34):
// numa conta sem estoque, o item muda medida, quantidade e as escolhas da
// composição, e o servidor refaz o retrato e as linhas. Com estoque, o item
// fica como foi vendido. Usa o mesmo modal do orçamento, com o contexto dele

// Components
import { ActionButton } from '@/components/common/ActionButton'
import { QuotationProdDetailModal } from '../../../orcamentos/components/QuotationItems/QuotationProdDetailModal'

// Contexts
import { QuotationProvider, useQuotation } from '@/contexts/quotationContext'

// Types
import type { QuotationItemType } from '@/types/sales/quotation'

// Icons
import { IconPencil } from '@tabler/icons-react'

function EditButton({ item }: { item: QuotationItemType }) {
  const { openChangeModal, modalType } = useQuotation()

  return (
    <>
      <ActionButton
        Icon={IconPencil}
        tooltip="Editar item"
        onClick={() => openChangeModal(true, 'productDetailEdit')}
      />
      <QuotationProdDetailModal
        open={modalType === 'productDetailEdit'}
        editMode
        data={item}
        composition={item.composition ?? undefined}
      />
    </>
  )
}

export function OrderItemEdit({ item }: { item: QuotationItemType }) {
  return (
    <QuotationProvider>
      <EditButton item={item} />
    </QuotationProvider>
  )
}
