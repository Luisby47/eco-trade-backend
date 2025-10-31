const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Extendiendo suscripciones de Maria y Carlos...\n');
  
  // Get current date
  const now = new Date();
  
  // Extend Maria's subscription (1 month from now)
  const mariaEndDate = new Date(now);
  mariaEndDate.setMonth(mariaEndDate.getMonth() + 1);
  
  const maria = await prisma.subscription.updateMany({
    where: {
      user: {
        email: 'maria@example.com'
      },
      plan: 'premium'
    },
    data: {
      start_date: now,
      end_date: mariaEndDate,
      status: 'activa'
    }
  });

  console.log(`✅ Maria: Suscripción premium extendida hasta ${mariaEndDate.toISOString().split('T')[0]}`);

  // Extend Carlos's subscription (1 month from now)
  const carlosEndDate = new Date(now);
  carlosEndDate.setMonth(carlosEndDate.getMonth() + 1);
  
  const carlos = await prisma.subscription.updateMany({
    where: {
      user: {
        email: 'carlos@example.com'
      },
      plan: 'profesional'
    },
    data: {
      start_date: now,
      end_date: carlosEndDate,
      status: 'activa'
    }
  });

  console.log(`✅ Carlos: Suscripción profesional extendida hasta ${carlosEndDate.toISOString().split('T')[0]}`);
  
  console.log('\n✨ Suscripciones actualizadas correctamente');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
