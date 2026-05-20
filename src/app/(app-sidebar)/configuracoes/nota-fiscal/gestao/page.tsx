import { redirect } from 'next/navigation'

export default function GestaoNfePage() {
  redirect('/nota-fiscal/emitir?tab=gestao')
}
