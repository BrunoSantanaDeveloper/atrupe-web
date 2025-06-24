// import { brlToFloat, parseCurrencyToCent } from '@/lib/utils'
import { z } from 'zod'

export const productSchema = z.object({
  productId: z.string(),
  description: z.string().min(1, 'Descrição é obrigatória'),
  quantity: z.coerce
    .number({
      required_error: 'Campo obrigatório',
      invalid_type_error: 'Quantidade deve ser um número',
    })
    .min(1, 'Quantidade deve ser maior ou igual a um'),
  imageUrl: z.string().optional().nullable(),
  technicalDescription: z.string().optional().nullable(),
  items: z.array(
    z.object({
      id: z.string(),
      name: z.string().optional(),
      unitOfMeasureId: z.string(),
      quantity: z
        .preprocess((value) => Number(value), z.number())
        .refine((value) => value >= 1, {
          message: 'A quantidade deve ser pelo menos 1',
        })
        .refine((value) => !isNaN(value), {
          message: 'Quantidade deve ser um número válido',
        }),
      width: z
        .number({
          required_error: 'Campo obrigatório',
          invalid_type_error: 'Largura deve ser um número',
        })
        .optional()
        .nullable(),
      /* height: z
        .number({
          required_error: 'Campo obrigatório',
          invalid_type_error: 'Altura deve ser um número',
        })
        .int()
        .positive()
        .optional()
        .nullable(), */
      height: z.coerce.number().positive().optional().nullable(),
      length: z
        .number({
          required_error: 'Campo obrigatório',
          invalid_type_error: 'Comprimento deve ser um número',
        })
        .int()
        .positive()
        .optional()
        .nullable(),
      weight: z
        .number({
          required_error: 'Campo obrigatório',
          invalid_type_error: 'Peso deve ser um número',
        })
        .int()
        .positive()
        .optional()
        .nullable(),
      volume: z
        .number({
          required_error: 'Campo obrigatório',
          invalid_type_error: 'Volume deve ser um número',
        })
        .int()
        .positive()
        .optional()
        .nullable(),
      distance: z
        .number({
          required_error: 'Campo obrigatório',
          invalid_type_error: 'Distância deve ser um número',
        })
        .int()
        .positive()
        .optional()
        .nullable(),
      duration: z
        .number({
          required_error: 'Campo obrigatório',
          invalid_type_error: 'Duração deve ser um número',
        })
        .int()
        .positive()
        .optional()
        .nullable(),

      unitCost: z.number(),
      salePrice: z.number(),
      measurementValue: z.number(),
    }),
  ),
  notes: z.string().optional().nullable(),
  discount: z
    .number({
      required_error: 'Campo obrigatório',
      invalid_type_error: 'Desconto deve ser um número',
    })
    .optional()
    .nullable(),
  discountType: z.enum(['percentual', 'valor']).optional().nullable(),
})

export type ProductsFormType = z.infer<typeof productSchema>

export const defaultProductValues: ProductsFormType = {
  productId: '',
  description: '',
  quantity: 1,
  imageUrl: '',
  technicalDescription: '',
  items: [
    {
      id: '',
      unitOfMeasureId: '',
      quantity: 1,
      width: 0,
      height: 0,
      length: 0,
      weight: 0,
      volume: 0,
      distance: 0,
      duration: 0,
      unitCost: 0,
      salePrice: 0,
      measurementValue: 0,
    },
  ],
  notes: '',
  discount: 0,
  discountType: 'percentual',
}
