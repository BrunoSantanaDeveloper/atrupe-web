import { z } from 'zod'

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
  isService: z.boolean().default(false),
  imageUrl: z.string().optional().nullable(),
  imageSize: z.string().optional().nullable(),
  items: z.array(
    z.object({
      id: z.string({ required_error: 'Campo obrigatório' }).trim().optional(),
      name: z
        .string({ required_error: 'Campo obrigatório' })
        .min(2, { message: 'Campo obrigatório' })
        .trim(),
      unitKind: z
        .string({ required_error: 'Campo obrigatório' })
        .min(2, { message: 'Campo obrigatório' })
        .trim(),
      unitCost: z.number().optional().nullable(),
      salePrice: z.number(),
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
      id: z.string({ required_error: 'Campo obrigatório' }).trim(),
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
  categoryId: '',
  sectorId: '',
  technicalDescription: null,
  allowEditValues: true,
  allowEditDescription: true,
  isService: false,
  imageUrl: null,
  imageSize: 'small',
  items: [
    {
      name: '',
      unitKind: '',
      unitCost: 0,
      salePrice: 0,
    },
  ],
  productionStages: [],
}
