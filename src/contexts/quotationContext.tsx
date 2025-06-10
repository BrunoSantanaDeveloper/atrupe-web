import React, { createContext, useContext, useState, ReactNode } from 'react'

export type ModalType =
  | 'sectorSelector'
  | 'productsList'
  | 'productDetail'
  | 'productDetailEdit'
  | null

interface QuotationData {
  sectorId: string | null
  categoryId: string | null
  productId: string | null
}

interface QuotationContextType {
  isModalOpen: boolean
  modalType: ModalType
  quotationData: QuotationData
  openModal: (type: ModalType) => void
  closeModal: () => void
  updateQuotationData: (data: Partial<QuotationData>) => void
}

const QuotationContext = createContext<QuotationContextType | undefined>(
  undefined,
)

export const QuotationProvider = ({ children }: { children: ReactNode }) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalType, setModalType] = useState<ModalType>(null)
  const [quotationData, setQuotationData] = useState<QuotationData>({
    sectorId: null,
    categoryId: null,
    productId: null,
  })

  const openModal = (type: ModalType) => {
    setIsModalOpen(true)
    setModalType(type)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setModalType(null)
  }

  const updateQuotationData = (data: Partial<QuotationData>) => {
    setQuotationData((prev) => ({ ...prev, ...data }))
  }
  return (
    <QuotationContext.Provider
      value={{
        isModalOpen,
        modalType,
        quotationData,
        openModal,
        closeModal,
        updateQuotationData,
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
