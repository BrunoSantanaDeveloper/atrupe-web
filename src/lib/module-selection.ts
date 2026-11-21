// As faixas de espaço dos arquivos de produção (GP-48 item 27) são
// complementos, uma por assinatura: marcar uma desmarca a outra. Nos
// complementos, a API troca a faixa contratada pela nova.

const STORAGE_TIER_PREFIX = 'production_storage_'

export const isStorageTierKey = (key: string) =>
  key.startsWith(STORAGE_TIER_PREFIX)

/** A lista de módulos escolhidos depois de marcar ou desmarcar um. */
export const toggleModuleKey = (
  selected: string[],
  key: string,
  checked: boolean,
) => {
  if (!checked) return selected.filter((item) => item !== key)
  if (selected.includes(key)) return selected
  const rest = isStorageTierKey(key)
    ? selected.filter((item) => !isStorageTierKey(item))
    : selected
  return [...rest, key]
}
