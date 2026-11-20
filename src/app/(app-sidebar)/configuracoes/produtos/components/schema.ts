import { z } from 'zod'

// A estrutura do produto (EP-1, 18/11/2026): define os blocos do cadastro.
// O terceirizado é a estrutura OUTSOURCED (a API guarda isOutsourced como
// espelho dela)
export const PRODUCT_STRUCTURES = [
  'STANDARD',
  'SHEET',
  'OFFSET',
  'RENTAL',
  'OUTSOURCED',
] as const
export type ProductStructure = (typeof PRODUCT_STRUCTURES)[number]

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
  structure: z.enum(PRODUCT_STRUCTURES).default('STANDARD'),
  // Produto terceirizado (T-5, 24/10/2026): fornecedores e custo do
  // fornecedor por unidade de venda (centavos, na unidade da tela)
  outsourcedCost: z.number().optional().nullable(),
  // Quantidade mínima (27/10/2026), na unidade comercial do produto: abaixo
  // dela o item é cobrado pelo mínimo; por unidade, o item nasce com ela
  minQuantity: z.union([z.number(), z.string(), z.null()]).optional(),
  suppliers: z
    .array(z.object({ id: z.string(), name: z.string() }))
    .default([]),
  supplierPick: z.any().optional().nullable(),
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
  structure: 'STANDARD',
  outsourcedCost: null,
  minQuantity: null,
  suppliers: [],
  supplierPick: null,
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
