// export const actionRules: { [key: string]: string[] } = {
//   notes: ['ALL'],
//   image: ['ALL'],
//   duplicate: ['OPEN'],
//   edit: ['OPEN'],
//   values: ['OPEN'],
//   delete: ['OPEN'],
//   addItem: ['OPEN'],
//   paymentConditions: ['OPEN'],
//   editQuotation: ['OPEN'],
//   duplicateQuotation: ['ALL'],
// }

// export const actionDisabled = (buttonType: string, status: string) => {
//   const rule = actionRules[buttonType]

//   if (rule?.includes('ALL')) return false

//   return !rule?.includes(status)
// }
