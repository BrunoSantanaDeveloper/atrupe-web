// Dicionário de glifos (design/openspec/changes/icones): um gesto, um ícone.
// Ações de aplicação usam o ícone daqui, nunca um escolhido na tela — é o que
// impede a lupa de significar "buscar" numa tela e "ver" na outra.
import {
  IconAlertTriangle,
  IconArrowLeft,
  IconBan,
  IconCalendarDollar,
  IconCash,
  IconCashBanknoteOff,
  IconChevronRight,
  IconCircleCheck,
  IconCircleX,
  IconCopy,
  IconDotsVertical,
  IconDownload,
  IconEye,
  IconFileInvoice,
  IconFileText,
  IconHistory,
  IconInfoCircle,
  IconNote,
  IconPaperclip,
  IconPencil,
  IconPlus,
  IconPrinter,
  IconReceipt,
  IconRefresh,
  IconRepeat,
  IconRotateClockwise,
  IconSearch,
  IconSend,
  IconTrash,
  IconUpload,
} from '@tabler/icons-react'

export const ICONE = {
  /** Abrir ou ver um registro. A lupa é só busca. */
  ver: IconEye,
  /** Campo e botão de busca. */
  buscar: IconSearch,
  editar: IconPencil,
  /** Apagar de vez. Inativar não usa a lixeira. */
  excluir: IconTrash,
  inativar: IconBan,
  reativar: IconRotateClockwise,
  duplicar: IconCopy,
  historico: IconHistory,
  /** Só imprime; navegar para uma ficha usa `documento`. */
  imprimir: IconPrinter,
  exportar: IconDownload,
  importar: IconUpload,
  emitirNota: IconSend,
  verNota: IconFileInvoice,
  consultarStatus: IconRefresh,
  reprocessar: IconRepeat,
  /** Navegar para ficha ou documento (com chevron ao lado). */
  documento: IconFileText,
  receber: IconCash,
  pagar: IconCashBanknoteOff,
  faturar: IconReceipt,
  editarParcelas: IconCalendarDollar,
  menuDeLinha: IconDotsVertical,
  novo: IconPlus,
  avancar: IconChevronRight,
  voltar: IconArrowLeft,
  observacao: IconNote,
  anexo: IconPaperclip,
  erro: IconCircleX,
  aviso: IconAlertTriangle,
  sucesso: IconCircleCheck,
  informacao: IconInfoCircle,
} as const

export type Gesto = keyof typeof ICONE
