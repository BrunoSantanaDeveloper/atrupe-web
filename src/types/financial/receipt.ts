export type ReceiptPdfType = {
  company: {
    name: string
    cnpj: string
    email: string
    phone: string
    siteUrl: string
    logoUrl: string
    address: {
      street: string
      number: string
      complement: string
      neighborhood: string
      city: string
      state: string
      zipcode: string
    }
    socialNetworks: {
      instagram: string
      facebook: string
      linkedin: string
    }
  }
  clientName: string
  totalValue: number
  day: string
  month: string
  year: string
  items: {
    reference: string
    description: string
    date: string
    paymentMethod: string
    value: number
  }[]
}
