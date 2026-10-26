// O que falta para o cliente sair do pré-cadastro (ALT-4). Espelha a regra
// do servidor (`determineClientStatus`): nome, CPF ou CNPJ, telefone ou
// celular e um endereço completo (CEP, estado, cidade, bairro e rua).

type Address = {
  zipcode?: string | null
  state?: string | null
  city?: string | null
  neighborhood?: string | null
  street?: string | null
}

type ClientLike = {
  type?: string
  general?: {
    name?: string | null
    cpf?: string | null
    cnpj?: string | null
    phone?: string | null
    mobile?: string | null
  } | null
  addresses?: Address[] | null
}

export function missingForRegular(client: ClientLike): string[] {
  const missing: string[] = []
  const general = client.general ?? {}
  if (!general.name) missing.push('nome')
  if (!general.cpf && !general.cnpj) {
    missing.push(client.type === 'COMPANY' ? 'CNPJ' : 'CPF')
  }
  if (!general.phone && !general.mobile) missing.push('telefone ou celular')
  const complete = (client.addresses ?? []).some(
    (address) =>
      address.zipcode &&
      address.state &&
      address.city &&
      address.neighborhood &&
      address.street,
  )
  if (!complete) missing.push('endereço completo')
  return missing
}
