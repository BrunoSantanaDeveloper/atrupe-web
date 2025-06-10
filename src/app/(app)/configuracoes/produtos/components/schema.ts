import { parseCurrencyToCent } from '@/lib/utils'
import { string, z } from 'zod'

export const newProductsSchema = z.object({
  id: z.string().optional(),
  name: z
    .string({ required_error: 'Campo obrigatório' })
    .min(2, { message: 'Campo obrigatório' })
    .max(100, 'Máximo 100 caracteres'),
  code: z
    .string({ required_error: 'Campo obrigatório' })
    .min(2, { message: 'Campo obrigatório' })
    .trim(),
  companyId: z.string({ required_error: 'Campo obrigatório' }).optional(),
  categoryId: z
    .string({ required_error: 'Campo obrigatório' })
    .min(2, { message: 'Campo obrigatório' })
    .trim(),
  sectorId: z
    .string({ required_error: 'Campo obrigatório' })
    .min(2, { message: 'Campo obrigatório' })
    .trim(),
  technicalDescription: z.string().optional().nullable(),
  allowEditValues: z.boolean().default(true),
  allowEditDescription: z.boolean().default(true),
  imageUrl: z.string().optional().nullable(),
  items: z.array(
    z.object({
      id: z.string({ required_error: 'Campo obrigatório' }).trim().optional(),
      name: z
        .string({ required_error: 'Campo obrigatório' })
        .min(2, { message: 'Campo obrigatório' })
        .trim(),
      unitOfMeasureId: z
        .string({ required_error: 'Campo obrigatório' })
        .min(2, { message: 'Campo obrigatório' })
        .trim(),
      unitCost: z
        .union([z.number(), z.string()])
        .transform((val) => parseCurrencyToCent(val.toString()))
        .refine((val) => !isNaN(val), {
          message: 'Formatado inválido',
        })
        .nullable()
        .optional(),
      salePrice: z
        .union([z.number(), z.string()])
        .transform((val) => parseCurrencyToCent(val.toString()))
        .refine((val) => !isNaN(val), {
          message: 'Formatado inválido',
        }),
      width: z
        .union([z.number(), z.string()])
        .transform((val) => parseFloat(val.toString()))
        .refine((val) => !isNaN(val), {
          message: 'Formatado inválido',
        })
        .optional()
        .nullable(),
      height: z
        .union([z.number(), z.string()])
        .transform((val) => parseFloat(val.toString()))
        .refine((val) => !isNaN(val), {
          message: 'Formatado inválido',
        })
        .optional()
        .nullable(),
      length: z
        .union([z.number(), z.string()])
        .transform((val) => parseFloat(val.toString()))
        .refine((val) => !isNaN(val), {
          message: 'Formatado inválido',
        })
        .optional()
        .nullable(),
      weight: z
        .union([z.number(), z.string()])
        .transform((val) => parseFloat(val.toString()))
        .refine((val) => !isNaN(val), {
          message: 'Formatado inválido',
        })
        .optional()
        .nullable(),
      volume: z
        .union([z.number(), z.string()])
        .transform((val) => parseFloat(val.toString()))
        .refine((val) => !isNaN(val), {
          message: 'Formatado inválido',
        })
        .optional()
        .nullable(),
      distance: z
        .union([z.number(), z.string()])
        .transform((val) => parseFloat(val.toString()))
        .refine((val) => !isNaN(val), {
          message: 'Formatado inválido',
        })
        .optional()
        .nullable(),
      duration: z
        .union([z.number(), z.string()])
        .transform((val) => parseFloat(val.toString()))
        .refine((val) => !isNaN(val), {
          message: 'Formatado inválido',
        })
        .optional()
        .nullable(),
    }),
  ),
  productionStages: z.array(
    z.object({
      id: string({ required_error: 'Campo obrigatório' }).trim(),
      name: z
        .string({ required_error: 'Campo obrigatório' })
        .min(2, { message: 'Campo obrigatório' })
        .trim(),
      icon: z.string().optional().nullable(),
      isActive: z.boolean().default(false),
    }),
  ),
})
// .refine(
//   (data) => {
//     if (!data.items || data.items.length === 0) {
//       return data.unitCost !== undefined
//     }
//     return true
//   },
//   {
//     message: 'Campo obrigatório',
//     path: ['unitCost'],
//   },
// )
// .refine(
//   (data) => {
//     if (!data.items || data.items.length === 0) {
//       return data.salePrice !== undefined
//     }
//     return true
//   },
//   {
//     message: 'Campo obrigatório',
//     path: ['salePrice'],
//   },
// )

export type NewProductsFormType = z.infer<typeof newProductsSchema>

export const defaultNewProductValues: NewProductsFormType = {
  name: '',
  code: '',
  companyId: '',
  categoryId: '',
  sectorId: '',
  technicalDescription: null,
  allowEditValues: true,
  allowEditDescription: true,
  imageUrl: null,
  items: [
    {
      name: '',
      unitOfMeasureId: '',
      unitCost: 0,
      salePrice: 0,
    },
  ],
  productionStages: [],
}
