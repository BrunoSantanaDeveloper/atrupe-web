export function extractConditions<
  T extends { conditions?: Array<{ id: string; isActive: boolean }> },
>(paymentMethods: T[]) {
  const conditions = (paymentMethods ?? [])
    .flatMap((method) => method.conditions ?? [])
    .map((condition) => ({
      id: condition.id,
      isActive: condition.isActive,
    }))

  return conditions
}
