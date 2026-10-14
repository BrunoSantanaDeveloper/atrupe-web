import { createContext, useContext, useState, ReactNode } from 'react'

export type ModalType =
  | 'sectorSelector'
  | 'productsList'
  | 'productDetail'
  | 'productDetailEdit'
  // O item montado na hora, quando não existe produto pronto (ORC-11)
  | 'composeItem'
  | null

interface QuotationData {
  sectorId: string | null
  categoryId: string | null
  productId: string | null
}

interface QuotationContextType {
  modalType: ModalType
  quotationData: QuotationData
  updateQuotationData: (data: Partial<QuotationData>) => void
  openChangeModal: (open: boolean, type?: ModalType) => void
}

const QuotationContext = createContext<QuotationContextType | undefined>(
  undefined,
)

export const QuotationProvider = ({ children }: { children: ReactNode }) => {
  const [modalType, setModalType] = useState<ModalType>(null)
  const [quotationData, setQuotationData] = useState<QuotationData>({
    sectorId: null,
    categoryId: null,
    productId: null,
  })

  const openChangeModal = (open: boolean, type?: ModalType) => {
    if (!open) {
      setModalType(null)
    } else {
      setModalType(type || null)
    }
  }

  const updateQuotationData = (data: Partial<QuotationData>) => {
    setQuotationData((prev) => ({ ...prev, ...data }))
  }
  return (
    <QuotationContext.Provider
      value={{
        modalType,
        quotationData,
        updateQuotationData,
        openChangeModal,
      }}
    >
      {children}
    </QuotationContext.Provider>
  )
}

export const useQuotation = (): QuotationContextType => {
  const context = useContext(QuotationContext)
  if (!context) {
    throw new Error('useQuotation must be used within a QuotationProvider')
  }
  return context
}
