const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Limpiando suscripciones básicas...');
  
  // Delete all "basico" subscriptions from the database
  const deleted = await prisma.subscription.deleteMany({
    where: {
      plan: 'basico'
    }
  });

  console.log(`✅ Eliminadas ${deleted.count} suscripciones básicas`);
  
  // Show remaining subscriptions
  const remaining = await prisma.subscription.findMany({
    select: {
      id: true,
      plan: true,
      status: true,
      user: {
        select: {
          email: true
        }
      }
    }
  });

  console.log('\n📋 Suscripciones restantes:');
  remaining.forEach(sub => {
    console.log(`  - ${sub.user.email}: ${sub.plan} (${sub.status})`);
  });
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
