// A página Novidades (19/11/2026): todas as atualizações liberadas para o
// plano da empresa, das mais novas para as mais antigas.

import { ReleaseNotesPage } from './components/ReleaseNotesPage'

export function metadata() {
  return {
    title: 'Novidades',
  }
}

export default function NovidadesPage() {
  return <ReleaseNotesPage />
}
