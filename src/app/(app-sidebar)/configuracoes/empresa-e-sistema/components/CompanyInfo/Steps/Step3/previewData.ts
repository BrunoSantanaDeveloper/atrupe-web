export const formData = {
  showImages: true,
  showDimensions: true,
  showUnitValue: true,
  showDiscounts: true,
  showFinalValue: true,
  showTotalValue: true,
  showPaymentDelivery: true,
  showItemsDetails: true,
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const quotationExampleData: any = {
  client: {
    name: 'Cliente Exemplo',
    document: {
      type: 'CPF',
      value: '012.345.678-90',
    },
    phone: '(11) 99999-9999',
    email: 'cliente.exemplo@email.com',
  },
  quotation: {
    number: 1,
    seriesCode: 'V1',
    description: 'Pré-visualização de orçamento',
    seller: {
      name: 'Fulano de Tal',
      signature: '/img/signature-example.png',
    },
    createdAt: new Date().toISOString(),
    dueDate: new Date(
      new Date().setDate(new Date().getDate() + 30),
    ).toISOString(),
    status: 'OPEN',
  },
  items: [
    {
      id: '1',
      image: '/img/product-placeholder.png',
      description: 'Produto de exemplo',
      composition: [
        {
          id: '1',
          name: 'Produto de exemplo',
          quantity: 1,
          unitOfMeasure: 'Metro Linear',
          unitPrice: 20000,
          totalPrice: 20000,
        },
      ],
      totalQuantity: 1,
      totalUnitPrice: 20000,
      discount: {
        type: 'NONE',
        value: 0,
        discountedValue: 0,
      },
      finalPrice: 20000,
    },
  ],
  delivery: {
    supplier: 'Transportadora Exemplo',
    daysAfterApproval: 30,
    freightCost: 1000,
    freightPrice: 1000,
    clientAddress: {
      street: 'Rua Exemplo',
      number: '123',
      neighborhood: 'Vila Boa',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '04538-132',
    },
  },
  payment: {
    totalInstallments: 3,
  },
  total: {
    subtotal: 20000,
    totalDiscount: 0,
    finalTotal: 20000,
  },
}
