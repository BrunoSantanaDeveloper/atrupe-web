// Third-party Imports
import { z } from 'zod'

export const duplicateSchemas = z.any()

const clientIdSchema = z
  .object({
    label: z.string(),
    value: z.string(),
  })
  .transform((value) => value.value)
  .nullable()

export const duplicateSchema = z.object({
  clientId: clientIdSchema,
  description: z.string().trim(),
})

export type DuplicateType = z.infer<typeof duplicateSchema>

// Tipo para os valores do formulário (antes da transformação)
export type DuplicateFormValues = z.input<typeof duplicateSchema>

export const getDefaultValues = (
  clientId?: string,
  clientName?: string,
  description?: string,
): DuplicateFormValues => ({
  clientId:
    clientId && clientName ? { label: clientName, value: clientId } : null,
  description: description || '',
})

export const defaultValues: DuplicateFormValues = {
  clientId: null,
  description: '',
}
