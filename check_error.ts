// run with: npx tsx check_error.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Fetching latest fiscal onboarding request...');
  const result = await prisma.fiscalOnboardingRequest.findFirst({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      status: true,
      errorMessage: true,
      companyId: true,
      cnpj: true
    }
  });
  console.log('Result:', result);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
