import { z } from 'zod'

export const newProductsSchema = z.object({
  id: z.string().optional(),
  name: z
    .string({ required_error: 'Campo obrigatório' })
    .min(1, { message: 'Campo obrigatório' })
    .min(2, { message: 'Mínimo de 2 caracteres' })
    .max(100, 'Máximo 100 caracteres'),
  code: z
    .string({ required_error: 'Campo obrigatório' })
    .min(1, { message: 'Campo obrigatório' })
    .min(2, { message: 'Mínimo de 2 caracteres' })
    .trim(),
  categoryId: z
    .string({ required_error: 'Campo obrigatório' })
    .min(1, { message: 'Campo obrigatório' })
    .min(2, { message: 'Mínimo de 2 caracteres' })
    .trim(),
  sectorId: z
    .string({ required_error: 'Campo obrigatório' })
    .min(1, { message: 'Campo obrigatório' })
    .min(2, { message: 'Mínimo de 2 caracteres' })
    .trim(),
  technicalDescription: z.string().optional().nullable(),
  // Produto novo nasce sem as liberações (decisão de 24/10/2026): editar
  // valor e descrição é para o Produto base e os de preço variável (ALT-8)
  allowEditValues: z.boolean().default(false),
  allowEditDescription: z.boolean().default(false),
  imageUrl: z.string().optional().nullable(),
  imageSize: z.string().optional().nullable(),
  items: z.array(
    z.object({
      id: z.string({ required_error: 'Campo obrigatório' }).trim().optional(),
      name: z
        .string({ required_error: 'Campo obrigatório' })
        .min(1, { message: 'Campo obrigatório' })
        .min(2, { message: 'Mínimo de 2 caracteres' })
        .trim(),
      unitKind: z
        .string({ required_error: 'Campo obrigatório' })
        .min(1, { message: 'Campo obrigatório' })
        .min(2, { message: 'Mínimo de 2 caracteres' })
        .trim(),
      unitCost: z.number().optional().nullable(),
      salePrice: z.number(),
      width: z
        .union([z.number(), z.string()])
        .transform((val) => parseFloat(val.toString()))
        .refine((val) => !isNaN(val), {
          message: 'Formato inválido',
        })
        .optional()
        .nullable(),
      height: z
        .union([z.number(), z.string()])
        .transform((val) => parseFloat(val.toString()))
        .refine((val) => !isNaN(val), {
          message: 'Formato inválido',
        })
        .optional()
        .nullable(),
      length: z
        .union([z.number(), z.string()])
        .transform((val) => parseFloat(val.toString()))
        .refine((val) => !isNaN(val), {
          message: 'Formato inválido',
        })
        .optional()
        .nullable(),
      weight: z
        .union([z.number(), z.string()])
        .transform((val) => parseFloat(val.toString()))
        .refine((val) => !isNaN(val), {
          message: 'Formato inválido',
        })
        .optional()
        .nullable(),
      volume: z
        .union([z.number(), z.string()])
        .transform((val) => parseFloat(val.toString()))
        .refine((val) => !isNaN(val), {
          message: 'Formato inválido',
        })
        .optional()
        .nullable(),
      distance: z
        .union([z.number(), z.string()])
        .transform((val) => parseFloat(val.toString()))
        .refine((val) => !isNaN(val), {
          message: 'Formato inválido',
        })
        .optional()
        .nullable(),
      duration: z
        .union([z.number(), z.string()])
        .transform((val) => parseFloat(val.toString()))
        .refine((val) => !isNaN(val), {
          message: 'Formato inválido',
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
        .min(1, { message: 'Campo obrigatório' })
        .min(2, { message: 'Mínimo de 2 caracteres' })
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
  allowEditValues: false,
  allowEditDescription: false,
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
