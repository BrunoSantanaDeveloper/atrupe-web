// Filter options for sales report

// Origin options - will be replaced with API call when ContactSource endpoint is available
export const originOptions = [
  { id: 'all', name: 'Todas' },
  { id: 'whatsapp', name: 'WhatsApp' },
  { id: 'site', name: 'Site' },
  { id: 'instagram', name: 'Instagram' },
  { id: 'balcao', name: 'Balcão' },
]

// Period options
export const periodOptions = [
  { id: 'current_month', name: 'Mês atual' },
  { id: 'last_6_months', name: 'Últimos 6 meses' },
  { id: 'last_12_months', name: 'Últimos 12 meses' },
  { id: 'last_24_months', name: 'Últimos 24 meses' },
  { id: 'last_36_months', name: 'Últimos 36 meses' },
  { id: 'custom', name: 'Personalizado' },
]
