// Components
import { AccountDetails } from './components/AccountDetails'

export function metadata() {
  return {
    title: 'Detalhes da conta',
  }
}

export default function AccountDetailsPage({
  params,
}: {
  params: { companyId: string }
}) {
  return <AccountDetails companyId={params.companyId} />
}
