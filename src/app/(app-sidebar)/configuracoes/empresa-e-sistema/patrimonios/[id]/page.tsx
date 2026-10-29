// A antiga página do bem (28/10/2026, design.md §19 item 8): o patrimônio
// passou a abrir numa janela só, a partir da lista. O endereço continua
// valendo para quem tinha o link e leva à lista com a janela aberta.

import { redirect } from 'next/navigation'

export default function AssetPage({ params }: { params: { id: string } }) {
  redirect(
    `/configuracoes/empresa-e-sistema/patrimonios?patrimonio=${encodeURIComponent(params.id)}`,
  )
}
