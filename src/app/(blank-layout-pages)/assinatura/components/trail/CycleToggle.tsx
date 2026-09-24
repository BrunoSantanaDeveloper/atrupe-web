export type Cycle = 'MONTHLY' | 'YEARLY'

/**
 * O preço em destaque é sempre por mês, para os ciclos se compararem pelo
 * mesmo eixo; o total do anual vai na linha de apoio. (O seletor do ciclo é
 * o CycleSwitch, em PlanOffer.)
 */
export function monthlyEquivalentCents(recurringCents: number, cycle: Cycle) {
  return cycle === 'YEARLY' ? Math.round(recurringCents / 12) : recurringCents
}
