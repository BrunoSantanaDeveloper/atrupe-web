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
      name: z.string().optional().nullable(),
      // O item pode estar sem unidade no banco — é o caso de parte das vendas
      // migradas. Exigir string travava o Salvar numa validação sem campo
      // visível na tela, e a edição não acontecia.
      unitKind: z.string().nullable().optional(),
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
      // Zero é válido: limpar o campo grava 0, e com a medida liberada no item
      // por unidade isso virou caminho normal. Exigir positivo reprovava o
      // Salvar com mensagem em inglês sob o campo.
      height: z.coerce.number().min(0).optional().nullable(),
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
      visualUnitCost: z.number().optional(),
      measurementValue: z.number().optional(),
    }),
  ),
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
      name: '',
      unitKind: '',
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
      visualUnitCost: 0,
      measurementValue: 0,
    },
  ],
}
