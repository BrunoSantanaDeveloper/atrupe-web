// O fim do expediente da empresa (HH:MM) e o aviso antes do bloqueio do dia
// seguinte (FC-14, CX-3): a meia hora do fim, quem está com caixa aberto é
// avisado para fechá-lo.
export const nearWorkdayEnd = (end: string | undefined, now = new Date()) => {
  const [hours, minutes] = (end || '18:00').split(':').map(Number)
  const endMinutes = hours * 60 + (minutes || 0)
  return now.getHours() * 60 + now.getMinutes() >= endMinutes - 30
}
